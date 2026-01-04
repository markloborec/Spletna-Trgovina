import { Schema, model, Types } from "mongoose";

export interface ReviewDoc {
  product_id: Types.ObjectId;
  user_id: Types.ObjectId;
  order_id?: Types.ObjectId | null;
  rating: number;      // 1..5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order_id: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 3, maxlength: 1000 },
  },
  { timestamps: true }
);

// 1 user -> 1 review na produkt
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

export const Review = model<ReviewDoc>("Review", reviewSchema);
