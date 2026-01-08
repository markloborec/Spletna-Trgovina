"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getMyOrders = getMyOrders;
exports.getOrderById = getOrderById;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
async function createOrder(req, res) {
    try {
        const { items, shippingAddress, payment, delivery } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "ITEMS_REQUIRED" });
        }
        if (!payment || !delivery) {
            return res.status(400).json({ error: "PAYMENT_AND_DELIVERY_REQUIRED" });
        }
        let finalShippingAddress = null;
        if (delivery === "courier") {
            if (req.user?.id) {
                if (shippingAddress && shippingAddress.street) {
                    finalShippingAddress = shippingAddress;
                }
                else {
                    const user = await User_1.User.findById(req.user.id).lean();
                    const profileAddr = user?.shippingAddress;
                    if (!profileAddr || !profileAddr.street) {
                        return res.status(400).json({ error: "PROFILE_ADDRESS_MISSING" });
                    }
                    finalShippingAddress = profileAddr;
                }
            }
            else {
                if (!shippingAddress || !shippingAddress.street) {
                    return res.status(400).json({ error: "SHIPPING_ADDRESS_REQUIRED" });
                }
                finalShippingAddress = shippingAddress;
            }
        }
        const productIds = items.map((i) => i.productId);
        for (const id of productIds) {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
            }
        }
        const products = await Product_1.Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });
        }
        let itemsTotal = 0;
        const orderItems = items.map((item) => {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (!product)
                return null;
            const qty = Number(item.qty);
            if (!qty || qty < 1)
                return null;
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
        const order = await Order_1.Order.create({
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
    }
    catch (error) {
        console.error("CREATE_ORDER_ERROR:", error);
        return res.status(500).json({ error: "CREATE_ORDER_FAILED" });
    }
}
function normalizeProductIdFromItem(it) {
    if (!it)
        return "";
    const candidate = it.productId ?? it.product_id ?? it.product?._id ?? it.product?.id ?? it.product;
    if (!candidate)
        return "";
    if (typeof candidate === "string")
        return candidate;
    if (typeof candidate === "object") {
        if (candidate._id)
            return String(candidate._id);
        if (typeof candidate.toString === "function")
            return candidate.toString();
    }
    return String(candidate);
}
async function getMyOrders(req, res) {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "AUTH_REQUIRED" });
        }
        const orders = await Order_1.Order.find({ user_id: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        // zberi productIds za reviewed status
        const productIds = Array.from(new Set(orders.flatMap((o) => (o.items ?? []).map((it) => normalizeProductIdFromItem(it)).filter(Boolean)))).filter((id) => mongoose_1.default.Types.ObjectId.isValid(id));
        const reviews = await Review_1.Review.find({
            user_id: req.user.id,
            product_id: { $in: productIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
        })
            .select("product_id")
            .lean();
        const reviewedSet = new Set(reviews.map((r) => String(r.product_id)));
        const mapped = orders.map((o) => ({
            orderId: String(o._id),
            status: o.status,
            date: o.createdAt,
            total: Number(o?.totals?.grandTotal ?? 0),
            items: (o.items ?? []).map((it) => {
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
    }
    catch (error) {
        console.error("GET_MY_ORDERS_ERROR:", error);
        return res.status(500).json({ error: "GET_MY_ORDERS_FAILED" });
    }
}
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "INVALID_ORDER_ID" });
        }
        const order = await Order_1.Order.findById(id).lean();
        if (!order)
            return res.status(404).json({ error: "ORDER_NOT_FOUND" });
        if (!req.user?.id)
            return res.status(401).json({ error: "AUTH_REQUIRED" });
        const isOwner = order.user_id && order.user_id.toString() === req.user.id;
        const isAdmin = req.user.is_admin === true;
        if (!isOwner && !isAdmin)
            return res.status(403).json({ error: "FORBIDDEN_ORDER_ACCESS" });
        return res.status(200).json(order);
    }
    catch (error) {
        console.error("GET_ORDER_BY_ID_ERROR:", error);
        return res.status(500).json({ error: "GET_ORDER_BY_ID_FAILED" });
    }
}
