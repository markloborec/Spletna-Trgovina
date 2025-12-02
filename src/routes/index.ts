import { Router } from "express";
import { Product } from "../models/Product";
import { authRouter } from "./authRoutes";

export const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// auth pod /api/auth/...
router.use("/auth", authRouter);

// debug products
router.get("/debug/products", async (req, res) => {
  try {
    const products = await Product.find().limit(5).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "MONGO_ERROR" });
  }
});

