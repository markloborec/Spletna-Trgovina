import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { updateMe } from "../controllers/usersController";

const usersRouter = Router();

// PUT /api/users/me
usersRouter.put("/me", authMiddleware, updateMe);

export default usersRouter;
