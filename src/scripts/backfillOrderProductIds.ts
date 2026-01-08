import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Order } from "../models/Order";
import { Product } from "../models/Product";

dotenv.config();

function normalizeName(s: string) {
    return (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

async function run() {
    await connectDB();

    const conn = mongoose.connection;

    console.log("Connected to DB name:", conn.name);
    console.log("Mongo host:", conn.host);
    console.log("Mongo port:", conn.port);

    // ✅ TS-safe guard
    if (!conn.db) {
        console.error("❌ mongoose.connection.db is undefined (not connected?)");
        await mongoose.disconnect();
        process.exit(1);
    }

    const collections = await conn.db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name));

    const orderCount = await Order.countDocuments({});
    const productCount = await Product.countDocuments({});
    console.log("Order.countDocuments =", orderCount);
    console.log("Product.countDocuments =", productCount);

    const sampleOrder = await Order.findOne({}).lean();
    console.log("Sample order exists:", !!sampleOrder);
    if (sampleOrder) {
        const items = (sampleOrder as any).items ?? [];
        console.log("Sample order _id:", String((sampleOrder as any)._id));
        console.log("Sample items length:", items.length);
        console.log("Sample item keys:", items[0] ? Object.keys(items[0]) : "no items");
        console.log("Sample item:", items[0] ?? null);
    }

    if (orderCount === 0) {
        console.log("❌ No orders found in this database/collection. Backfill aborted.");
        await mongoose.disconnect();
        return;
    }

    // Lookup produktov po imenu
    const products = await Product.find().select("_id name").lean();
    const byName = new Map<string, string>();
    for (const p of products as any[]) {
        byName.set(normalizeName(p.name), String(p._id));
    }

    const orders = await Order.find().lean(false); // docs (da lahko save)
    let touchedOrders = 0;
    let fixedItems = 0;
    let skippedItems = 0;

    for (const o of orders as any[]) {
        let changed = false;

        const items: any[] = o.items ?? [];
        for (const it of items) {
            const hasPid =
                !!it.productId ||
                !!it.product_id ||
                !!it.product ||
                !!it.product?._id;

            if (hasPid) continue;

            const name = String(it?.name ?? "");
            const pid = byName.get(normalizeName(name));

            if (pid) {
                it.productId = pid;
                changed = true;
                fixedItems++;
            } else {
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

    await mongoose.disconnect();
}

run().catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
});
