import { Router } from "express";
import {
  getProductById,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// seznam produktov
router.get("/", getProducts);

// en produkt po ID
router.get("/:id", getProductById);

// ustvarjanje produkta (admin)
router.post("/", authMiddleware, createProduct);

// posodobitev produkta (admin)
router.put("/:id", authMiddleware, updateProduct);

// brisanje produkta (admin)
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
