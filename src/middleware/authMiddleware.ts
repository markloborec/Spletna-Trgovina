import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    is_admin: boolean;
  };
}

// ✅ Obvezen auth (npr. /orders/my, /orders/:id)
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "AUTH_MISSING_TOKEN" });
    }

    const token = authHeader.split(" ")[1];
    const payload: any = verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      is_admin: payload.is_admin === true,
    };

    next();
  } catch (err) {
    console.error("AUTH_ERROR:", err);
    return res.status(401).json({ error: "AUTH_INVALID_TOKEN" });
  }
}


export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload: any = verifyToken(token);

      req.user = {
        id: payload.userId,
        email: payload.email,
        is_admin: payload.is_admin === true,
      };
    }

    next();
  } catch (err) {
    // če je token slab, nadaljuj kot guest
    next();
  }
}
