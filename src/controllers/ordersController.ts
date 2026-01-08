import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Review } from "../models/Review";

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { items, shippingAddress, payment, delivery } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ITEMS_REQUIRED" });
    }

    if (!payment || !delivery) {
      return res.status(400).json({ error: "PAYMENT_AND_DELIVERY_REQUIRED" });
    }

    let finalShippingAddress: any = null;

    if (delivery === "courier") {
      if (req.user?.id) {
        if (shippingAddress && shippingAddress.street) {
          finalShippingAddress = shippingAddress;
        } else {
          const user = await User.findById(req.user.id).lean();
          const profileAddr = (user as any)?.shippingAddress;

          if (!profileAddr || !profileAddr.street) {
            return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });
          }

          finalShippingAddress = profileAddr;
        }
      } else {
        if (!shippingAddress || !shippingAddress.street) {
          return res.status(400).json({ error: "SHIPPING_ADDRESS_REQUIRED" });
        }
        finalShippingAddress = shippingAddress;
      }
    }

    const productIds = items.map((i: any) => i.productId);
    for (const id of productIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
      }
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });
    }

    let itemsTotal = 0;

    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) return null;

      const qty = Number(item.qty);
      if (!qty || qty < 1) return null;

      const unitPrice = product.price;
      const lineTotal = unitPrice * qty;
      itemsTotal += lineTotal;

      return {
        productId: product._id.toString(),
        name: product.name,
        qty,
        unitPrice,
        lineTotal,
      };
    });

    if (orderItems.some((x) => x === null)) {
      return res.status(400).json({ error: "INVALID_QTY" });
    }

    const tax = 0;
    const shipping = delivery === "courier" ? 2.99 : 0;
    const grandTotal = itemsTotal + tax + shipping;

    const order = await Order.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "",
      items: orderItems,
      payment,
      delivery,
      shippingAddress: finalShippingAddress,
      totals: { itemsTotal, tax, shipping, grandTotal },
      status: "created",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return res.status(500).json({ error: "CREATE_ORDER_FAILED" });
  }
}

function normalizeProductIdFromItem(it: any): string {
  if (!it) return "";

  const candidate =
    it.productId ?? it.product_id ?? it.product?._id ?? it.product?.id ?? it.product;

  if (!candidate) return "";

  if (typeof candidate === "string") return candidate;
  if (typeof candidate === "object") {
    if (candidate._id) return String(candidate._id);
    if (typeof candidate.toString === "function") return candidate.toString();
  }

  return String(candidate);
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "AUTH_REQUIRED" });
    }

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // zberi productIds za reviewed status
    const productIds = Array.from(
      new Set(
        orders.flatMap((o: any) =>
          (o.items ?? []).map((it: any) => normalizeProductIdFromItem(it)).filter(Boolean)
        )
      )
    ).filter((id) => mongoose.Types.ObjectId.isValid(id));

    const reviews = await Review.find({
      user_id: req.user.id,
      product_id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select("product_id")
      .lean();

    const reviewedSet = new Set(reviews.map((r: any) => String(r.product_id)));

    const mapped = orders.map((o: any) => ({
      orderId: String(o._id),
      status: o.status,
      date: o.createdAt,
      total: Number(o?.totals?.grandTotal ?? 0),
      items: (o.items ?? []).map((it: any) => {
        const pid = normalizeProductIdFromItem(it);
        return {
          productId: pid,
          name: it.name,
          qty: it.qty,
          reviewed: pid ? reviewedSet.has(pid) : false,
        };
      }),
    }));

    return res.status(200).json({ orders: mapped });
  } catch (error) {
    console.error("GET_MY_ORDERS_ERROR:", error);
    return res.status(500).json({ error: "GET_MY_ORDERS_FAILED" });
  }
}

export async function getOrderById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "INVALID_ORDER_ID" });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ error: "ORDER_NOT_FOUND" });

    if (!req.user?.id) return res.status(401).json({ error: "AUTH_REQUIRED" });

    const isOwner = order.user_id && order.user_id.toString() === req.user.id;
    const isAdmin = req.user.is_admin === true;
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "FORBIDDEN_ORDER_ACCESS" });

    return res.status(200).json(order);
  } catch (error) {
    console.error("GET_ORDER_BY_ID_ERROR:", error);
    return res.status(500).json({ error: "GET_ORDER_BY_ID_FAILED" });
  }
}
