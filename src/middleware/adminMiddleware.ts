import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "AUTH_REQUIRED" });
  }

  if (req.user.is_admin !== true) {
    return res.status(403).json({ error: "ADMIN_ONLY" });
  }

  next();
}
