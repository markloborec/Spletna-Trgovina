import { Router } from "express";
import { priceCart } from "../controllers/cartController";

const router = Router();

router.post("/price", priceCart);

export default router;
