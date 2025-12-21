import { Router } from "express";
import { login, register, getMe, forgotPassword, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/me", authMiddleware, getMe);
