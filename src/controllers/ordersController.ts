import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { items, shippingAddress, payment, delivery } = req.body;

    // 1. Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ITEMS_REQUIRED" });
    }

    if (!shippingAddress || !shippingAddress.street) {
      return res.status(400).json({ error: "SHIPPING_ADDRESS_REQUIRED" });
    }

    if (!payment || !delivery) {
      return res.status(400).json({ error: "PAYMENT_AND_DELIVERY_REQUIRED" });
    }

    // 2. Validate product IDs
    const productIds = items.map((i: any) => i.productId);
    for (const id of productIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
      }
    }

    // 3. Load products from DB
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });
    }

    // 4. Build order items snapshot
    let itemsTotal = 0;

    const orderItems = items.map((item: any) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );

      if (!product) {
        throw new Error("PRODUCT_MISMATCH");
      }

      const qty = Number(item.qty);
      if (!qty || qty < 1) {
        throw new Error("INVALID_QTY");
      }

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

    // 5. Totals calculation
    const tax = 0; // placeholder
    const shipping = delivery === "courier" ? 5 : 0;
    const grandTotal = itemsTotal + tax + shipping;

    // 6. Create order
    const order = await Order.create({
      user_id: req.user?.id || null,
      user_email: req.user?.email || "",
      items: orderItems,
      payment,
      delivery,
      shippingAddress,
      totals: {
        itemsTotal,
        tax,
        shipping,
        grandTotal,
      },
      status: "created",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return res.status(500).json({ error: "CREATE_ORDER_FAILED" });
  }
}
/**
 * GET /api/orders/my
 * Vrne vsa naročila prijavljenega uporabnika
 */
export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "AUTH_REQUIRED" });
    }

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orders);
  } catch (error) {
    console.error("GET_MY_ORDERS_ERROR:", error);
    return res.status(500).json({ error: "GET_MY_ORDERS_FAILED" });
  }
}

/**
 * GET /api/orders/:id
 * Vrne eno naročilo, če je user owner ali admin
 */
export async function getOrderById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "INVALID_ORDER_ID" });
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ error: "ORDER_NOT_FOUND" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "AUTH_REQUIRED" });
    }

    const isOwner = order.user_id && order.user_id.toString() === req.user.id;
    const isAdmin = req.user.is_admin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "FORBIDDEN_ORDER_ACCESS" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("GET_ORDER_BY_ID_ERROR:", error);
    return res.status(500).json({ error: "GET_ORDER_BY_ID_FAILED" });
  }
}