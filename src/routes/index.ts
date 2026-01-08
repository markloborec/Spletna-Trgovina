import { Router } from "express";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { authRouter } from "./authRoutes";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Review } from "../models/Review";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthRequest,
} from "../middleware/authMiddleware";

export const router = Router();

/**
 * ✅ STATIC SERVING ZA SLIKE (backend/public/product-images/*)
 * Dostopno na:
 *   http://localhost:4000/api/product-images/<file>
 *
 * OPOMBA:
 * Ker je ta router mountan na /api, bo pot /api/product-images/...
 * Če želiš /product-images/... brez /api, to moraš dodati v glavnem app/server fajlu.
 */
router.use(
  "/product-images",
  express.static(path.join(process.cwd(), "public", "product-images"))
);

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);

type OrderItemInput = { productId: string; qty: number };

type ShippingAddress = {
  fullName: string;
  street: string;
  city?: string;
  postalCode?: string;
  phone?: string;
};

function buildFullName(user: any) {
  const first = (user?.firstName ?? "").toString().trim();
  const last = (user?.lastName ?? "").toString().trim();
  const full = `${first} ${last}`.trim();
  return full || (user?.fullName ?? user?.name ?? "").toString().trim();
}

function normalizeGuestAddress(a: any): ShippingAddress | null {
  if (!a || typeof a !== "object") return null;

  const fullName = (a.fullName ?? "").toString().trim();
  const street = (a.street ?? "").toString().trim();
  const city = (a.city ?? "").toString().trim();
  const postalCode = (a.postalCode ?? "").toString().trim();
  const phone = (a.phone ?? "").toString().trim();

  if (!fullName || !street || !city || !postalCode) return null;
  return { fullName, street, city, postalCode, phone };
}

function extractProfileAddress(user: any): ShippingAddress | null {
  const deliveryAddress = (user?.deliveryAddress ?? "").toString().trim();
  if (deliveryAddress) {
    return {
      fullName: buildFullName(user) || "Uporabnik",
      street: deliveryAddress,
      city: (user?.city ?? "").toString().trim() || undefined,
      postalCode: (user?.postalCode ?? "").toString().trim() || undefined,
      phone: (user?.phone ?? "").toString().trim() || undefined,
    };
  }

  const candidates = [
    user?.shippingAddress,
    user?.address,
    user?.userAddress,
    user?.profile?.address,
    user?.profile?.shippingAddress,
  ].filter(Boolean);

  for (const c of candidates) {
    const fullName = (c.fullName ?? c.name ?? buildFullName(user) ?? "")
      .toString()
      .trim();
    const street = (c.street ?? c.addressLine ?? c.line1 ?? "")
      .toString()
      .trim();
    const city = (c.city ?? c.town ?? "").toString().trim();
    const postalCode = (c.postalCode ?? c.post ?? c.zip ?? "")
      .toString()
      .trim();
    const phone = (c.phone ?? user?.phone ?? "").toString().trim();

    if (fullName && street) {
      return {
        fullName,
        street,
        city: city || undefined,
        postalCode: postalCode || undefined,
        phone: phone || undefined,
      };
    }
  }

  return null;
}

router.post("/orders", optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const body = req.body ?? {};
    const itemsRaw = Array.isArray(body.items) ? body.items : [];

    if (itemsRaw.length === 0) {
      return res.status(400).json({ error: "ITEMS_REQUIRED" });
    }

    const payment = (body.payment ?? "").toString().trim();
    const delivery = (body.delivery ?? "").toString().trim();

    if (!payment || !delivery) {
      return res.status(400).json({ error: "PAYMENT_AND_DELIVERY_REQUIRED" });
    }

    const items: OrderItemInput[] = itemsRaw.map((it: any) => ({
      productId: (it?.productId ?? "").toString().trim(),
      qty: Number(it?.qty),
    }));

    for (const it of items) {
      if (!it.productId || !mongoose.Types.ObjectId.isValid(it.productId)) {
        return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
      }
      if (!Number.isFinite(it.qty) || it.qty < 1) {
        return res.status(400).json({ error: "INVALID_QTY" });
      }
    }

    let shippingAddress: ShippingAddress | null = null;
    let addressSource: "none" | "guest" | "profile" = "none";

    if (delivery === "pickup") {
      shippingAddress = null;
      addressSource = "none";
    } else if (delivery === "courier") {
      const guestAddr = normalizeGuestAddress(body.shippingAddress);
      if (guestAddr) {
        shippingAddress = guestAddr;
        addressSource = "guest";
      }

      if (!shippingAddress && req.user?.id) {
        const user: any = await User.findById(req.user.id).lean();
        if (!user) return res.status(401).json({ error: "AUTH_USER_NOT_FOUND" });

        const profileAddr = extractProfileAddress(user);
        if (!profileAddr) {
          return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });
        }

        shippingAddress = profileAddr;
        addressSource = "profile";
      }

      if (!shippingAddress) {
        return res.status(400).json({ error: "SHIPPING_ADDRESS_REQUIRED" });
      }

      if (addressSource === "profile") {
        if (!shippingAddress.fullName || !shippingAddress.street) {
          return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });
        }
      }
    } else {
      return res.status(400).json({ error: "INVALID_DELIVERY_METHOD" });
    }

    const productIds = items.map((i: OrderItemInput) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });
    }

    let itemsTotal = 0;

    const orderItems = items.map((it: OrderItemInput) => {
      const product = products.find((p) => p._id.toString() === it.productId)!;

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * it.qty;
      itemsTotal += lineTotal;

      return {
        productId: product._id.toString(),
        name: product.name,
        qty: it.qty,
        unitPrice,
        lineTotal,
      };
    });

    const tax = 0;
    const shipping = delivery === "courier" ? 2.99 : 0;
    const grandTotal = itemsTotal + tax + shipping;

    const order = await Order.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "",
      items: orderItems,
      payment,
      delivery,
      totals: { itemsTotal, tax, shipping, grandTotal },
      shippingAddress: shippingAddress ?? null,
      status: "created",
    });

    return res.status(201).json({ orderId: order._id.toString() });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "ORDER_CREATE_FAILED" });
  }
});

router.get("/orders/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const productIdStrings = Array.from(
      new Set(
        orders
          .flatMap((o: any) => (o.items ?? []).map((it: any) => it?.productId))
          .filter(
            (id: any) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
          )
      )
    ) as string[];

    const productObjectIds = productIdStrings.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const reviews = await Review.find({
      user_id: req.user.id,
      product_id: { $in: productObjectIds },
    })
      .select("product_id")
      .lean();

    const reviewedSet = new Set(reviews.map((r: any) => r.product_id.toString()));

    const mapped = orders.map((o: any) => ({
      orderId: o._id.toString(),
      status: o.status ?? "created",
      date: o.createdAt,
      total: o?.totals?.grandTotal ?? 0,
      items: (o.items ?? []).map((it: any) => ({
        productId: (it?.productId ?? "").toString(),
        name: it.name,
        qty: it.qty,
        reviewed:
          typeof it?.productId === "string" &&
          reviewedSet.has(it.productId.toString()),
      })),
    }));

    return res.json({ orders: mapped });
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return res.status(500).json({ error: "ORDERS_FETCH_FAILED" });
  }
});

// debug products
router.get("/debug/products", async (req, res) => {
  try {
    const products = await Product.find().limit(5).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "MONGO_ERROR" });
  }
});
