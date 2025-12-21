"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCart = calculateCart;
const mongoose_1 = require("mongoose");
const Product_1 = require("../models/Product");
const ProductVariant_1 = require("../models/ProductVariant");
const TAX_RATE = 0.22;
const SHIPPING_FIXED = 5;
async function calculateCart(inputItems) {
    if (!Array.isArray(inputItems) || inputItems.length === 0) {
        throw { status: 400, error: "CART_ITEMS_REQUIRED" };
    }
    // basic input validation
    for (const it of inputItems) {
        if (!it || typeof it !== "object") {
            throw { status: 400, error: "CART_ITEM_INVALID" };
        }
        if (!(0, mongoose_1.isValidObjectId)(it.productId)) {
            throw { status: 400, error: "CART_PRODUCT_ID_INVALID" };
        }
        if (!(0, mongoose_1.isValidObjectId)(it.variantId)) {
            throw { status: 400, error: "CART_VARIANT_ID_INVALID" };
        }
        if (typeof it.quantity !== "number" || !Number.isInteger(it.quantity) || it.quantity < 1) {
            throw { status: 400, error: "CART_QUANTITY_INVALID" };
        }
    }
    // fetch all variants
    const variantIds = inputItems.map((x) => x.variantId);
    const variants = await ProductVariant_1.ProductVariant.find({ _id: { $in: variantIds } }).lean();
    // quick lookup
    const variantById = new Map();
    for (const v of variants)
        variantById.set(v._id.toString(), v);
    // fetch all products (unique)
    const productIdsUnique = Array.from(new Set(inputItems.map((x) => x.productId)));
    const products = await Product_1.Product.find({ _id: { $in: productIdsUnique } }).lean();
    const productById = new Map();
    for (const p of products)
        productById.set(p._id.toString(), p);
    const pricedItems = [];
    for (const it of inputItems) {
        const product = productById.get(it.productId);
        if (!product)
            throw { status: 404, error: "CART_PRODUCT_NOT_FOUND", productId: it.productId };
        const variant = variantById.get(it.variantId);
        if (!variant)
            throw { status: 404, error: "CART_VARIANT_NOT_FOUND", variantId: it.variantId };
        // variant must belong to product
        if (variant.product?.toString() !== it.productId) {
            throw { status: 400, error: "CART_VARIANT_PRODUCT_MISMATCH" };
        }
        // stock check
        const stockQty = typeof variant.stock_quantity === "number" ? variant.stock_quantity : 0;
        if (it.quantity > stockQty) {
            throw {
                status: 409,
                error: "OUT_OF_STOCK",
                variantId: it.variantId,
                available: stockQty,
                requested: it.quantity,
            };
        }
        // price
        const basePrice = typeof product.price === "number" ? product.price : 0;
        const extraPrice = typeof variant.extra_price === "number" ? variant.extra_price : 0;
        const unitPrice = basePrice + extraPrice;
        const lineTotal = unitPrice * it.quantity;
        pricedItems.push({
            productId: it.productId,
            variantId: it.variantId,
            name: product.name,
            variantName: variant.variant_name,
            quantity: it.quantity,
            unitPrice,
            lineTotal,
        });
    }
    const subtotal = pricedItems.reduce((sum, x) => sum + x.lineTotal, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shipping = pricedItems.length > 0 ? SHIPPING_FIXED : 0;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    return { items: pricedItems, subtotal, tax, shipping, total };
}
