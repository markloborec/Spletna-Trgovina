import { Router } from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { authRouter } from "./authRoutes";
import { Order } from "../models/Order";
import { User } from "../models/User";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthRequest,
} from "../middleware/authMiddleware";
import { cartRouter } from "./cart";


export const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/cart", cartRouter);


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
 *   shippingAddress?: { fullName, street, citrouter.post("/orders", authMiddleware, async (req: AuthRequest, res) => {
  const session = await mongoose.startSession();

  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const body = req.body ?? {};
    const payment = (body.payment ?? "").toString().trim();
    const delivery = (body.delivery ?? "").toString().trim();

    if (!payment || !delivery) {
      return res.status(400).json({ error: "PAYMENT_AND_DELIVERY_REQUIRED" });
    }
    if (!["cod", "card", "bank"].includes(payment)) {
      return res.status(400).json({ error: "INVALID_PAYMENT_METHOD" });
    }
    if (!["courier", "pickup"].includes(delivery)) {
      return res.status(400).json({ error: "INVALID_DELIVERY_METHOD" });
    }

    // shipping address (same rules as before)
    let shippingAddress: ShippingAddress | null = null;
    let addressSource: "none" | "guest" | "profile" = "none";

    if (delivery === "pickup") {
      shippingAddress = null;
      addressSource = "none";
    } else {
      const guestAddr = normalizeGuestAddress(body.shippingAddress);
      if (guestAddr) {
        shippingAddress = guestAddr;
        addressSource = "guest";
      }

      if (!shippingAddress && req.user?.id) {
        const user: any = await User.findById(req.user.id).lean();
        if (!user) return res.status(401).json({ error: "AUTH_USER_NOT_FOUND" });

        const profileAddr = extractProfileAddress(user);
        if (!profileAddr) return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });

        shippingAddress = profileAddr;
        addressSource = "profile";
      }

      if (!shippingAddress) return res.status(400).json({ error: "SHIPPING_ADDRESS_REQUIRED" });

      if (addressSource === "profile") {
        if (!shippingAddress.fullName || !shippingAddress.street) {
          return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });
        }
      }
    }

    // 🔒 Transaction: snapshot + stock decrement + clear cart + create order
    await session.withTransaction(async () => {
      const cart: any = await Cart.findOne({ userId: req.user!.id }).session(session);
      const items = cart?.items ?? [];

      if (!Array.isArray(items) || items.length === 0) {
        throw { status: 400, body: { error: "CART_EMPTY" } };
      }

      const productIds = [...new Set(items.map((it: any) => it.productId.toString()))];
      const products: any[] = await Product.find({ _id: { $in: productIds } }).session(session).lean();

      // build snapshot + validate + compute totals
      const TAX_RATE = 0.22;
      const SHIPPING_FEE = 2.99;

      let itemsTotal = 0;

      const orderItems = items.map((it: any) => {
        const p = products.find((x) => x._id.toString() === it.productId.toString());
        if (!p) throw { status: 400, body: { error: "PRODUCT_NOT_FOUND", productId: it.productId.toString() } };

        const v = (p.variants ?? []).find((vv: any) => vv._id.toString() === it.variantId.toString());
        if (!v) throw { status: 400, body: { error: "VARIANT_NOT_FOUND", productId: p._id.toString(), variantId: it.variantId.toString() } };

        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || qty < 1) throw { status: 400, body: { error: "INVALID_QTY" } };

        const unitPrice = Number(p.price) + Number(v.priceDelta ?? 0);
        const lineTotal = unitPrice * qty;
        itemsTotal += lineTotal;

        return {
          productId: p._id.toString(),
          variantId: v._id.toString(),
          variantName: v.name,
          name: p.name,
          qty,
          unitPrice,
          lineTotal,
        };
      });

      const tax = Math.round(itemsTotal * TAX_RATE * 100) / 100;
      const shipping = delivery === "courier" ? SHIPPING_FEE : 0;
      const grandTotal = Math.round((itemsTotal + tax + shipping) * 100) / 100;

      // stock decrement (atomic per item)
      for (const it of items) {
        const qty = Number(it.quantity);

        const upd = await Product.updateOne(
          {
            _id: it.productId,
            "variants._id": it.variantId,
            "variants.stock": { $gte: qty },
          },
          { $inc: { "variants.$.stock": -qty } }
        ).session(session);

        if ((upd as any).matchedCount === 0) {
          throw {
            status: 409,
            body: {
              error: "OUT_OF_STOCK",
              productId: it.productId.toString(),
              variantId: it.variantId.toString(),
            },
          };
        }
      }

      const order = await Order.create(
        [
          {
            user_id: req.user!.id,
            user_email: req.user!.email ?? "",
            items: orderItems,
            payment,
            delivery,
            totals: { itemsTotal, tax, shipping, grandTotal },
            shippingAddress: shippingAddress ?? null,
            status: "created",
          },
        ],
        { session }
      );

      await Cart.updateOne({ userId: req.user!.id }, { $set: { items: [] } }).session(session);

      (res as any)._orderId = order[0]._id.toString();
    });

    return res.status(201).json({ orderId: (res as any)._orderId });
  } catch (error: any) {
    const status = error?.status ?? 500;
    const body = error?.body ?? { error: "ORDER_CREATE_FAILED" };
    console.error("ORDER_CREATE_ERROR:", error);
    return res.status(status).json(body);
  } finally {
    session.endSession();
  }
});


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
