import mongoose from "mongoose";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";

const TAX_RATE = 0.22;
const SHIPPING_FEE = 2.99;

// helper: get or create cart
async function getOrCreateCart(userId: string) {
  const existing = await Cart.findOne({ userId }).lean();
  if (existing) return existing;
  const created = await Cart.create({ userId, items: [] });
  return created.toObject();
}

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

type PriceItemInput = { productId: string; variantId: string; quantity: number };

async function buildCartView(items: { productId: any; variantId: any; quantity: number; _id?: any }[]) {
  // load all products
  const productIds = [...new Set(items.map(i => i.productId.toString()))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  const lines = items.map((it) => {
    const p = products.find(x => x._id.toString() === it.productId.toString());
    if (!p) {
      return { ok: false, error: "PRODUCT_NOT_FOUND", productId: it.productId.toString() };
    }

    const v = (p.variants ?? []).find((vv: any) => vv._id.toString() === it.variantId.toString());
    if (!v) {
      return { ok: false, error: "VARIANT_NOT_FOUND", productId: p._id.toString(), variantId: it.variantId.toString() };
    }

    const qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return { ok: false, error: "INVALID_QUANTITY", itemId: it._id?.toString?.() };
    }

    if (qty > Number(v.stock)) {
      return {
        ok: false,
        error: "OUT_OF_STOCK",
        productId: p._id.toString(),
        variantId: v._id.toString(),
        requested: qty,
        available: Number(v.stock),
      };
    }

    const unitPrice = Number(p.price) + Number(v.priceDelta ?? 0);
    const lineTotal = unitPrice * qty;

    return {
      ok: true,
      itemId: it._id?.toString?.(),
      productId: p._id.toString(),
      productName: p.name,
      variantId: v._id.toString(),
      variantName: v.name,
      qty,
      unitPrice,
      lineTotal,
    };
  });

  const firstErr = lines.find((l: any) => !l.ok);
  if (firstErr) return { ok: false, error: firstErr };

  const okLines = lines as any[];
  const subtotal = okLines.reduce((s, l) => s + l.lineTotal, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = okLines.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + tax + shipping;

  return {
    ok: true,
    lines: okLines,
    totals: {
      subtotal,
      tax,
      shipping,
      total,
    },
  };
}

// POST /api/cart/price  (tvoj obstoječ flow, samo da je variant-aware)
export async function priceCart(req: AuthRequest, res: Response) {
  try {
    const body = req.body ?? {};
    const raw = Array.isArray(body.items) ? body.items : [];

    const items: PriceItemInput[] = raw.map((it: any) => ({
      productId: (it?.productId ?? "").toString(),
      variantId: (it?.variantId ?? "").toString(),
      quantity: Number(it?.quantity),
    }));

    if (items.length === 0) return res.status(400).json({ error: "ITEMS_REQUIRED" });

    for (const it of items) {
      if (!isValidId(it.productId) || !isValidId(it.variantId)) return res.status(400).json({ error: "INVALID_ID" });
      if (!Number.isFinite(it.quantity) || it.quantity < 1) return res.status(400).json({ error: "INVALID_QUANTITY" });
    }

    const view = await buildCartView(items as any);
    if (!view.ok) return res.status(400).json(view.error);

    return res.json({ items: view.lines, totals: view.totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_PRICE_FAILED" });
  }
}

// GET /api/cart
export async function getCart(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const cart = await getOrCreateCart(req.user.id);
    const view = await buildCartView((cart as any).items ?? []);
    if (!view.ok) return res.status(400).json(view.error);

    return res.json({ cartId: (cart as any)._id?.toString?.(), items: view.lines, totals: view.totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_GET_FAILED" });
  }
}

// POST /api/cart/items
export async function addItemToCart(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const productId = (req.body?.productId ?? "").toString();
    const variantId = (req.body?.variantId ?? "").toString();
    const quantity = Number(req.body?.quantity);

    if (!isValidId(productId) || !isValidId(variantId)) return res.status(400).json({ error: "INVALID_ID" });
    if (!Number.isFinite(quantity) || quantity < 1) return res.status(400).json({ error: "INVALID_QUANTITY" });

    // load product + variant for validation + stock
    const p: any = await Product.findById(productId).lean();
    if (!p) return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });

    const v: any = (p.variants ?? []).find((vv: any) => vv._id.toString() === variantId);
    if (!v) return res.status(400).json({ error: "VARIANT_NOT_FOUND" });

    // get cart
    const cartDoc = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $setOnInsert: { userId: req.user.id, items: [] } },
      { new: true, upsert: true }
    );

    // merge same product+variant
    const existing = cartDoc.items.find(
      (it: any) => it.productId.toString() === productId && it.variantId.toString() === variantId
    );

    const newQty = (existing ? existing.quantity : 0) + quantity;
    if (newQty > Number(v.stock)) {
      return res.status(400).json({
        error: "OUT_OF_STOCK",
        requested: newQty,
        available: Number(v.stock),
        productId,
        variantId,
      });
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      cartDoc.items.push({
  productId: new mongoose.Types.ObjectId(productId),
  variantId: new mongoose.Types.ObjectId(variantId),
  quantity,
});
    }

    await cartDoc.save();

    const view = await buildCartView(cartDoc.items as any);
    if (!view.ok) return res.status(400).json(view.error);

    return res.status(201).json({ items: view.lines, totals: view.totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_ADD_FAILED" });
  }
}

// PUT /api/cart/items/:itemId
export async function updateCartItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const itemId = (req.params.itemId ?? "").toString();
    const quantity = Number(req.body?.quantity);

    if (!isValidId(itemId)) return res.status(400).json({ error: "INVALID_ITEM_ID" });
    if (!Number.isFinite(quantity) || quantity < 0) return res.status(400).json({ error: "INVALID_QUANTITY" });

    const cartDoc: any = await Cart.findOne({ userId: req.user.id });
    if (!cartDoc) return res.json({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });

    const idx = cartDoc.items.findIndex((it: any) => it._id.toString() === itemId);
    if (idx === -1) return res.status(404).json({ error: "CART_ITEM_NOT_FOUND" });

    if (quantity === 0) {
      cartDoc.items.splice(idx, 1);
      await cartDoc.save();
    } else {
      const it = cartDoc.items[idx];
      const p: any = await Product.findById(it.productId).lean();
      if (!p) return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });

      const v: any = (p.variants ?? []).find((vv: any) => vv._id.toString() === it.variantId.toString());
      if (!v) return res.status(400).json({ error: "VARIANT_NOT_FOUND" });

      if (quantity > Number(v.stock)) {
        return res.status(400).json({
          error: "OUT_OF_STOCK",
          requested: quantity,
          available: Number(v.stock),
          productId: it.productId.toString(),
          variantId: it.variantId.toString(),
        });
      }

      it.quantity = quantity;
      await cartDoc.save();
    }

    const view = await buildCartView(cartDoc.items as any);
    if (!view.ok) return res.status(400).json(view.error);

    return res.json({ items: view.lines, totals: view.totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_UPDATE_FAILED" });
  }
}

// DELETE /api/cart/items/:itemId
export async function removeCartItem(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const itemId = (req.params.itemId ?? "").toString();
    if (!isValidId(itemId)) return res.status(400).json({ error: "INVALID_ITEM_ID" });

    const cartDoc: any = await Cart.findOne({ userId: req.user.id });
    if (!cartDoc) return res.json({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });

    cartDoc.items = cartDoc.items.filter((it: any) => it._id.toString() !== itemId);
    await cartDoc.save();

    const view = await buildCartView(cartDoc.items as any);
    if (!view.ok) return res.status(400).json(view.error);

    return res.json({ items: view.lines, totals: view.totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_REMOVE_FAILED" });
  }
}

// DELETE /api/cart
export async function clearCart(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });

    const cartDoc: any = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    return res.json({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0 } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "CART_CLEAR_FAILED" });
  }
}
