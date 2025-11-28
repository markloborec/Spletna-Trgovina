import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant_name: { type: String, required: true },
    sku: { type: String },
    stock_quantity: { type: Number, default: 0 },
    extra_price: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
