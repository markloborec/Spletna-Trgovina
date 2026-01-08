"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../models/Product");
const authRoutes_1 = require("./authRoutes");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const Review_1 = require("../models/Review");
const authMiddleware_1 = require("../middleware/authMiddleware");
exports.router = (0, express_1.Router)();
/**
 * ✅ STATIC SERVING ZA SLIKE (backend/public/product-images/*)
 * Dostopno na:
 *   http://localhost:4000/api/product-images/<file>
 *
 * OPOMBA:
 * Ker je ta router mountan na /api, bo pot /api/product-images/...
 * Če želiš /product-images/... brez /api, to moraš dodati v glavnem app/server fajlu.
 */
exports.router.use("/product-images", express_2.default.static(path_1.default.join(process.cwd(), "public", "product-images")));
exports.router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
exports.router.use("/auth", authRoutes_1.authRouter);
function buildFullName(user) {
    const first = (user?.firstName ?? "").toString().trim();
    const last = (user?.lastName ?? "").toString().trim();
    const full = `${first} ${last}`.trim();
    return full || (user?.fullName ?? user?.name ?? "").toString().trim();
}
function normalizeGuestAddress(a) {
    if (!a || typeof a !== "object")
        return null;
    const fullName = (a.fullName ?? "").toString().trim();
    const street = (a.street ?? "").toString().trim();
    const city = (a.city ?? "").toString().trim();
    const postalCode = (a.postalCode ?? "").toString().trim();
    const phone = (a.phone ?? "").toString().trim();
    if (!fullName || !street || !city || !postalCode)
        return null;
    return { fullName, street, city, postalCode, phone };
}
function extractProfileAddress(user) {
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
exports.router.post("/orders", authMiddleware_1.optionalAuthMiddleware, async (req, res) => {
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
        const items = itemsRaw.map((it) => ({
            productId: (it?.productId ?? "").toString().trim(),
            qty: Number(it?.qty),
        }));
        for (const it of items) {
            if (!it.productId || !mongoose_1.default.Types.ObjectId.isValid(it.productId)) {
                return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
            }
            if (!Number.isFinite(it.qty) || it.qty < 1) {
                return res.status(400).json({ error: "INVALID_QTY" });
            }
        }
        let shippingAddress = null;
        let addressSource = "none";
        if (delivery === "pickup") {
            shippingAddress = null;
            addressSource = "none";
        }
        else if (delivery === "courier") {
            const guestAddr = normalizeGuestAddress(body.shippingAddress);
            if (guestAddr) {
                shippingAddress = guestAddr;
                addressSource = "guest";
            }
            if (!shippingAddress && req.user?.id) {
                const user = await User_1.User.findById(req.user.id).lean();
                if (!user)
                    return res.status(401).json({ error: "AUTH_USER_NOT_FOUND" });
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
        }
        else {
            return res.status(400).json({ error: "INVALID_DELIVERY_METHOD" });
        }
        const productIds = items.map((i) => i.productId);
        const products = await Product_1.Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(400).json({ error: "PRODUCT_NOT_FOUND" });
        }
        let itemsTotal = 0;
        const orderItems = items.map((it) => {
            const product = products.find((p) => p._id.toString() === it.productId);
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
        const order = await Order_1.Order.create({
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
    }
    catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ error: "ORDER_CREATE_FAILED" });
    }
});
exports.router.get("/orders/my", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });
        const orders = await Order_1.Order.find({ user_id: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        const productIdStrings = Array.from(new Set(orders
            .flatMap((o) => (o.items ?? []).map((it) => it?.productId))
            .filter((id) => typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id))));
        const productObjectIds = productIdStrings.map((id) => new mongoose_1.default.Types.ObjectId(id));
        const reviews = await Review_1.Review.find({
            user_id: req.user.id,
            product_id: { $in: productObjectIds },
        })
            .select("product_id")
            .lean();
        const reviewedSet = new Set(reviews.map((r) => r.product_id.toString()));
        const mapped = orders.map((o) => ({
            orderId: o._id.toString(),
            status: o.status ?? "created",
            date: o.createdAt,
            total: o?.totals?.grandTotal ?? 0,
            items: (o.items ?? []).map((it) => ({
                productId: (it?.productId ?? "").toString(),
                name: it.name,
                qty: it.qty,
                reviewed: typeof it?.productId === "string" &&
                    reviewedSet.has(it.productId.toString()),
            })),
        }));
        return res.json({ orders: mapped });
    }
    catch (error) {
        console.error("Error fetching my orders:", error);
        return res.status(500).json({ error: "ORDERS_FETCH_FAILED" });
    }
});
// debug products
exports.router.get("/debug/products", async (req, res) => {
    try {
        const products = await Product_1.Product.find().limit(5).lean();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "MONGO_ERROR" });
    }
});
