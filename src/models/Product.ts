import mongoose from "mongoose";

export type ProductType = "cycles" | "equipment" | "clothing";

const productSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cycles", "equipment", "clothing"],
      required: true,
      index: true,
    },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    name: { type: String, required: true },

    short_description: { type: String },
    long_description: { type: String },

    price: { type: Number, required: true },

    brand: { type: String },
    image_url: { type: String },

    inStock: { type: Boolean, default: true },

    warrantyMonths: { type: Number, default: 24 },

    officialProductSite: { type: String },

    // ✅ equipment-specific (manjkalo)
    material: { type: String },
    weight: { type: Number }, // grams
    compatibility: { type: [String], default: [] }, // e.g. ["MTB","Road"]
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
