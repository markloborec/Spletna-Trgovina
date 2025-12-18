import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, trim: true },
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

const guestAddressSchema = new mongoose.Schema(
    {
        fullName: { type: String, trim: true, default: "" },
        street: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        postalCode: { type: String, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        // samo za registrirane/prijavljene: user_id bo nastavljen
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        user_email: { type: String, trim: true, lowercase: true, default: "" },

        items: { type: [orderItemSchema], required: true },

        payment: { type: String, required: true, trim: true },  // 'cod', 'card', ...
        delivery: { type: String, required: true, trim: true }, // 'courier', 'pickup', ...

        totals: { type: totalsSchema, required: true },

        guestAddress: { type: guestAddressSchema, default: null },

        status: { type: String, default: "obdelano", trim: true }, // created/paid/shipped/...
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
