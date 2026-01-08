import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
