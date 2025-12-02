import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    is_admin: boolean;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "AUTH_MISSING_TOKEN" });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    //preveriš, ali user še obstaja v bazi
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return res.status(401).json({ error: "AUTH_USER_NOT_FOUND" });
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      is_admin: payload.is_admin
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "AUTH_INVALID_TOKEN" });
  }
}
