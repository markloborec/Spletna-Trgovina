import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware";
import { createOrder, getMyOrders, getOrderById } from "../controllers/ordersController";

const router = Router();

router.post("/", optionalAuthMiddleware, createOrder);

router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

export default router;
