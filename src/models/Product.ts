import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String, required: true },
    short_description: { type: String },
    long_description: { type: String },
    price: { type: Number, required: true },
    brand: { type: String },
    image_url: { type: String },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

