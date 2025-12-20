import { Router } from "express";
import {
  getProductById,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
} from "../controllers/productsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

// public
router.get("/", getProducts);
router.get("/:id/variants", getProductVariants); // <-- DODANO, MORA BITI TU
router.get("/:id", getProductById);

// admin-only
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
