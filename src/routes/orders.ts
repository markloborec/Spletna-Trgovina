import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import mongoose from "mongoose";

const router = Router();

/**
 * POST /api/orders
 * Creates an order from the authenticated user's cart:
 * - snapshot items
 * - decrement stock (embedded variants on Product)
 * - clear cart
 * - all in a transaction
 */
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const { payment, delivery, shippingAddress } = req.body ?? {};

  // validation aligned with Order schema
  if (!payment || !["cod", "card", "bank"].includes(payment)) {
    return res.status(400).json({ error: "ORDER_INVALID_PAYMENT" });
  }

  if (!delivery || !["courier", "pickup"].includes(delivery)) {
    return res.status(400).json({ error: "ORDER_INVALID_DELIVERY" });
  }

  if (!shippingAddress?.fullName || !shippingAddress?.street) {
    return res.status(400).json({ error: "ORDER_MISSING_SHIPPING_ADDRESS" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "CART_EMPTY" });
    }

    const orderItems: any[] = [];

    for (const ci of cart.items) {
      const productId = ci.productId;
      const variantId = ci.variantId;
      const qty = Number(ci.quantity);

      if (!productId || !variantId || !Number.isFinite(qty) || qty <= 0) {
        throw new Error("CART_INVALID_ITEM");
      }

      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const variant: any = (product as any).variants?.find(
        (v: any) => String(v._id) === String(variantId)
      );

      if (!variant) throw new Error("VARIANT_NOT_FOUND");

      const stock = Number(variant.stock_quantity ?? variant.stock ?? 0);
      if (stock < qty) throw new Error("OUT_OF_STOCK");

      // decrement stock on embedded variant
      if (variant.stock_quantity !== undefined) variant.stock_quantity = stock - qty;
      else variant.stock = stock - qty;

      await product.save({ session });

      const unitPrice =
        Number(product.price ?? 0) + Number(variant.extra_price ?? variant.extraPrice ?? 0);

      orderItems.push({
        productId: String(product._id),
        variantId: String(variant._id),
        variantName: variant.variant_name ?? variant.name ?? "",
        name: product.name,
        qty, // ✅ required by Order schema
        unitPrice,
        lineTotal: unitPrice * qty,
        imageUrl: product.image_url ?? "",
      });
    }

    // ✅ totals aligned with Order schema
    const itemsTotal = orderItems.reduce((s, it) => s + it.lineTotal, 0);
    const tax = Math.round(itemsTotal * 0.22 * 100) / 100;

    // delivery enum is courier|pickup; keep shipping simple
    const shipping = delivery === "courier" ? 2.99 : 0;

    const grandTotal = Math.round((itemsTotal + tax + shipping) * 100) / 100;

    const created = await Order.create(
      [
        {
          user_id: new mongoose.Types.ObjectId(userId), // ✅ required
          user_email: req.user?.email ?? "",

          items: orderItems,

          payment,
          delivery,

          totals: { itemsTotal, tax, shipping, grandTotal },

          shippingAddress, // must include fullName + street

          status: "created",
        },
      ],
      { session }
    );

    // clear cart
    cart.items.splice(0, cart.items.length);
    await cart.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      ok: true,
      orderId: created[0]._id.toString(),
      items: created[0].items,
      totals: created[0].totals,
    });
  } catch (e: any) {
    await session.abortTransaction();

    const msg = String(e?.message ?? "ORDER_FAILED");

    if (msg === "OUT_OF_STOCK") return res.status(409).json({ error: "OUT_OF_STOCK" });
    if (msg === "PRODUCT_NOT_FOUND") return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    if (msg === "VARIANT_NOT_FOUND") return res.status(404).json({ error: "VARIANT_NOT_FOUND" });
    if (msg === "CART_INVALID_ITEM") return res.status(400).json({ error: "CART_INVALID_ITEM" });

    return res.status(500).json({ error: "ORDER_FAILED", detail: msg });
  } finally {
    session.endSession();
  }
});

export default router;