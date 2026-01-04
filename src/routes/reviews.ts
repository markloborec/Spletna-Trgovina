import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { addOrUpdateReview, deleteReview, listProductReviews } from "../controllers/reviewController";

const router = Router();

router.get("/products/:productId/reviews", listProductReviews);
router.post("/products/:productId/reviews", authMiddleware, addOrUpdateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
