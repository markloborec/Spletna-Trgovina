import { Router } from "express";
import { getCategories } from "../controllers/categoriesController";

const router = Router();

router.get("/", getCategories);

export default router;
