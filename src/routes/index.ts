import { Router } from "express";
import { Product } from "../models/Product";
import { authRouter } from "./authRoutes";
import { Order } from "../models/Order";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";

export const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// auth pod /api/auth/...
router.use("/auth", authRouter);

/**
 * POST /api/orders
 * Shrani naročilo v MongoDB.
 * Če je user prijavljen (ima Bearer token), se poveže z user_id.
 */
router.post("/orders", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const body = req.body ?? {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ error: "ORDER_EMPTY" });
    }

    // osnovna validacija items
    for (const it of items) {
      const productId = (it?.productId ?? "").toString().trim();
      const name = (it?.name ?? "").toString().trim();
      const qty = Number(it?.qty);
      const unitPrice = Number(it?.unitPrice);
      const lineTotal = Number(it?.lineTotal);

      if (!productId || !name) return res.status(400).json({ error: "ORDER_INVALID_ITEM" });
      if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: "ORDER_INVALID_ITEM" });
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return res.status(400).json({ error: "ORDER_INVALID_ITEM" });
      if (!Number.isFinite(lineTotal) || lineTotal < 0) return res.status(400).json({ error: "ORDER_INVALID_ITEM" });
    }

    // totals
    const totals = body.totals ?? {};
    const itemsTotal = Number(totals.itemsTotal);
    const tax = Number(totals.tax);
    const shipping = Number(totals.shipping);
    const grandTotal = Number(totals.grandTotal);

    if (
      !Number.isFinite(itemsTotal) || itemsTotal < 0 ||
      !Number.isFinite(tax) || tax < 0 ||
      !Number.isFinite(shipping) || shipping < 0 ||
      !Number.isFinite(grandTotal) || grandTotal < 0
    ) {
      return res.status(400).json({ error: "ORDER_INVALID_TOTALS" });
    }

    const payment = (body.payment ?? "").toString().trim();
    const delivery = (body.delivery ?? "").toString().trim();

    if (!payment || !delivery) {
      return res.status(400).json({ error: "ORDER_MISSING_FIELDS" });
    }

    const order = await Order.create({
      user_id: req.user.id,
      user_email: req.user.email,
      items,
      payment,
      delivery,
      totals: { itemsTotal, tax, shipping, grandTotal },
      guestAddress: null,
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
 * Samo za registrirane/prijavljene uporabnike.
 * Izpiše zahtevana polja:
 * - številko naročila
 * - status
 * - naziv izdelka
 * - količino
 * - datum naročila
 * - skupno ceno naročila
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
