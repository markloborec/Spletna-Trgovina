import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, trim: true }, // (lahko kasneje ObjectId)
        name: { type: String, required: true, trim: true },
        qty: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const totalsSchema = new mongoose.Schema(
    {
        itemsTotal: { type: Number, required: true, min: 0 },
        tax: { type: Number, required: true, min: 0 },
        shipping: { type: Number, required: true, min: 0 },
        grandTotal: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        fullName: { type: String, trim: true, required: true },
        street: { type: String, trim: true, required: true },
        city: { type: String, trim: true, required: true },
        postalCode: { type: String, trim: true, required: true },
        phone: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        user_email: { type: String, trim: true, lowercase: true, default: "" },

        items: { type: [orderItemSchema], required: true },

        payment: {
            type: String,
            required: true,
            trim: true,
            enum: ["cod", "card", "bank"],
        },

        delivery: {
            type: String,
            required: true,
            trim: true,
            enum: ["courier", "pickup"],
        },

        totals: { type: totalsSchema, required: true },

        shippingAddress: {
            fullName: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: false, default: "" },
            postalCode: { type: String, required: false, default: "" },
            phone: { type: String, required: false, default: "" },
        },

        status: {
            type: String,
            trim: true,
            enum: ["created", "paid", "shipped", "cancelled"],
            default: "created",
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
