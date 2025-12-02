import { Router } from "express";
import { login, register, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, getMe);
