import { Router } from "express";
import { getProductById, getProducts } from "../controllers/productsController";

const router = Router();

// seznam produktov
router.get("/", getProducts);

// en produkt po ID
router.get("/:id", getProductById);

export default router;

