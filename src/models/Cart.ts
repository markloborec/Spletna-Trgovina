import mongoose, { Schema, Types } from "mongoose";

export type CartItemInput = {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
};

// ✅ ključ: items je DocumentArray (Mongoose subdocuments)
export type CartDocument = mongoose.Document & {
  userId: Types.ObjectId;
  items: mongoose.Types.DocumentArray<CartItemInput>;
  createdAt: Date;
  updatedAt: Date;
};

const CartItemSchema = new Schema<CartItemInput>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const CartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<CartDocument>("Cart", CartSchema);
