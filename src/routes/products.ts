import { Router } from "express";
import {
  getProductById,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  getProductReviews,
  createProductReview,
} from "../controllers/productsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

/** PUBLIC **/
router.get("/", getProducts);
router.get("/:id/variants", getProductVariants);
router.get("/:id/reviews", getProductReviews);
router.get("/:id", getProductById);

/** REVIEWS (auth) **/
router.post("/:id/reviews", authMiddleware, createProductReview);

/** ADMIN **/
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
