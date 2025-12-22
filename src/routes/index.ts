import { Router } from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { authRouter } from "./authRoutes";
import { Order } from "../models/Order";
import { User } from "../models/User";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthRequest,
} from "../middleware/authMiddleware";

export const router = Router();

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

// ✅ guest address mora imeti vse (street + city + postalCode)
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

// ✅ profile address: podpiramo tvoj format deliveryAddress: string
function extractProfileAddress(user: any): ShippingAddress | null {
  // 1) tvoj primer: deliveryAddress je string (npr. "Hmhlamd 123")
  const deliveryAddress = (user?.deliveryAddress ?? "").toString().trim();
  if (deliveryAddress) {
    return {
      fullName: buildFullName(user) || "Uporabnik",
      street: deliveryAddress,
      // city/postalCode nimata smisla, ker jih nimaš v profilu
      city: (user?.city ?? "").toString().trim() || undefined,
      postalCode: (user?.postalCode ?? "").toString().trim() || undefined,
      phone: (user?.phone ?? "").toString().trim() || undefined,
    };
  }

  // 2) če imaš kdaj objektne variante (za vsak slučaj)
  const candidates = [
    user?.shippingAddress,
    user?.address,
    user?.userAddress,
    user?.profile?.address,
    user?.profile?.shippingAddress,
  ].filter(Boolean);

  for (const c of candidates) {
    const fullName = (c.fullName ?? c.name ?? buildFullName(user) ?? "").toString().trim();
    const street = (c.street ?? c.addressLine ?? c.line1 ?? "").toString().trim();
    const city = (c.city ?? c.town ?? "").toString().trim();
    const postalCode = (c.postalCode ?? c.post ?? c.zip ?? "").toString().trim();
    const phone = (c.phone ?? user?.phone ?? "").toString().trim();

    // pri profilu zahtevamo vsaj fullName + street
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

/**
 * POST /api/orders
 * Payload:
 * {
 *   items: [{ productId, qty }],
 *   payment: "card"|"cod"|"bank",
 *   delivery: "courier"|"pickup",
 *   shippingAddress?: { fullName, street, city, postalCode, phone } | null
 * }
 */
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

    // normalize items
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

    // shipping address
    let shippingAddress: ShippingAddress | null = null;
    let addressSource: "none" | "guest" | "profile" = "none";

    if (delivery === "pickup") {
      shippingAddress = null;
      addressSource = "none";
    } else if (delivery === "courier") {
      // 1) guest form
      const guestAddr = normalizeGuestAddress(body.shippingAddress);
      if (guestAddr) {
        shippingAddress = guestAddr;
        addressSource = "guest";
      }

      // 2) profile, če je user prijavljen in guest ni poslal
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

      // 3) validacija:
      // - guest: mora imeti fullName + street + city + postalCode (že ureja normalizeGuestAddress)
      // - profile: dovolimo fullName + street (city/postalCode sta optional)
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

    // load products & compute totals
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

/**
 * GET /api/orders/my
 */
router.get("/orders/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = orders.map((o: any) => ({
      orderId: o._id.toString(),
      status: o.status ?? "created",
      date: o.createdAt,
      total: o?.totals?.grandTotal ?? 0,
      items: (o.items ?? []).map((it: any) => ({
        name: it.name,
        qty: it.qty,
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
