"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productVariantSchema = new mongoose_1.default.Schema({
    product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product", required: true },
    variant_name: { type: String, required: true },
    sku: { type: String },
    stock_quantity: { type: Number, default: 0 },
    extra_price: { type: Number, default: 0 }
}, { timestamps: true });
exports.ProductVariant = mongoose_1.default.model("ProductVariant", productVariantSchema);
