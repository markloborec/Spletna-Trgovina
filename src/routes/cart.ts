import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  priceCart,
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController";

export const cartRouter = Router();

cartRouter.post("/price", priceCart);

// ✅ prava košarica (persist)
cartRouter.get("/", authMiddleware, getCart);
cartRouter.post("/items", authMiddleware, addItemToCart);
cartRouter.put("/items/:itemId", authMiddleware, updateCartItem);
cartRouter.delete("/items/:itemId", authMiddleware, removeCartItem);
cartRouter.delete("/", authMiddleware, clearCart);


// obstoječi kalkulator cene (ostane!)
cartRouter.post("/price", priceCart);
