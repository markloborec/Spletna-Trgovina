"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
dotenv_1.default.config();
function normalizeName(s) {
    return (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}
async function run() {
    await (0, db_1.connectDB)();
    const conn = mongoose_1.default.connection;
    console.log("Connected to DB name:", conn.name);
    console.log("Mongo host:", conn.host);
    console.log("Mongo port:", conn.port);
    // ✅ TS-safe guard
    if (!conn.db) {
        console.error("❌ mongoose.connection.db is undefined (not connected?)");
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
    const collections = await conn.db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name));
    const orderCount = await Order_1.Order.countDocuments({});
    const productCount = await Product_1.Product.countDocuments({});
    console.log("Order.countDocuments =", orderCount);
    console.log("Product.countDocuments =", productCount);
    const sampleOrder = await Order_1.Order.findOne({}).lean();
    console.log("Sample order exists:", !!sampleOrder);
    if (sampleOrder) {
        const items = sampleOrder.items ?? [];
        console.log("Sample order _id:", String(sampleOrder._id));
        console.log("Sample items length:", items.length);
        console.log("Sample item keys:", items[0] ? Object.keys(items[0]) : "no items");
        console.log("Sample item:", items[0] ?? null);
    }
    if (orderCount === 0) {
        console.log("❌ No orders found in this database/collection. Backfill aborted.");
        await mongoose_1.default.disconnect();
        return;
    }
    // Lookup produktov po imenu
    const products = await Product_1.Product.find().select("_id name").lean();
    const byName = new Map();
    for (const p of products) {
        byName.set(normalizeName(p.name), String(p._id));
    }
    const orders = await Order_1.Order.find().lean(false); // docs (da lahko save)
    let touchedOrders = 0;
    let fixedItems = 0;
    let skippedItems = 0;
    for (const o of orders) {
        let changed = false;
        const items = o.items ?? [];
        for (const it of items) {
            const hasPid = !!it.productId ||
                !!it.product_id ||
                !!it.product ||
                !!it.product?._id;
            if (hasPid)
                continue;
            const name = String(it?.name ?? "");
            const pid = byName.get(normalizeName(name));
            if (pid) {
                it.productId = pid;
                changed = true;
                fixedItems++;
            }
            else {
                skippedItems++;
            }
        }
        if (changed) {
            await o.save();
            touchedOrders++;
        }
    }
    console.log("✅ Backfill done");
    console.log("Orders updated:", touchedOrders);
    console.log("Items fixed:", fixedItems);
    console.log("Items skipped (no product match):", skippedItems);
    await mongoose_1.default.disconnect();
}
run().catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
});
