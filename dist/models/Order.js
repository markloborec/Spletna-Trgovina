"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderItemSchema = new mongoose_1.default.Schema({
    productId: { type: String, required: true, trim: true }, // (lahko kasneje ObjectId)
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
}, { _id: false });
const totalsSchema = new mongoose_1.default.Schema({
    itemsTotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
}, { _id: false });
const addressSchema = new mongoose_1.default.Schema({
    fullName: { type: String, trim: true, required: true },
    street: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
}, { _id: false });
const orderSchema = new mongoose_1.default.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
    user_email: { type: String, trim: true, lowercase: true, default: "" },
    items: { type: [orderItemSchema], required: true },
    payment: {
        type: String,
        required: true,
        trim: true,
        enum: ["cod", "card"],
    },
    delivery: {
        type: String,
        required: true,
        trim: true,
        enum: ["courier", "pickup"],
    },
    totals: { type: totalsSchema, required: true },
    shippingAddress: { type: addressSchema, required: true },
    status: {
        type: String,
        trim: true,
        enum: ["created", "paid", "shipped", "cancelled"],
        default: "created",
    },
}, { timestamps: true });
exports.Order = mongoose_1.default.model("Order", orderSchema);
