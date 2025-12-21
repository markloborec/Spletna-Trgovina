"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    deliveryAddress: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    password_hash: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    resetPasswordTokenHash: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
}, { timestamps: true });
exports.User = mongoose_1.default.model("User", userSchema);
