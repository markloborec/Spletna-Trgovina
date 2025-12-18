"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["cycles", "equipment", "clothing"],
        required: true,
        index: true,
    },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String, required: true },
    short_description: { type: String },
    long_description: { type: String },
    price: { type: Number, required: true },
    brand: { type: String },
    image_url: { type: String },
    inStock: { type: Boolean, default: true },
    warrantyMonths: { type: Number, default: 24 },
    officialProductSite: { type: String },
}, { timestamps: true });
exports.Product = mongoose_1.default.model("Product", productSchema);
