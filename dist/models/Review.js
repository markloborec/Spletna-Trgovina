"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    user_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    order_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "", maxlength: 500 },
}, { timestamps: true });
reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
exports.Review = mongoose_1.default.model("Review", reviewSchema);
