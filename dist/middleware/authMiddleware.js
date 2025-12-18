"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "AUTH_MISSING_TOKEN" });
        }
        const token = authHeader.split(" ")[1];
        const payload = (0, jwt_1.verifyToken)(token);
        //preveriš, ali user še obstaja v bazi
        const user = await User_1.User.findById(payload.userId).lean();
        if (!user) {
            return res.status(401).json({ error: "AUTH_USER_NOT_FOUND" });
        }
        req.user = {
            id: payload.userId,
            email: payload.email,
            is_admin: payload.is_admin
        };
        next();
    }
    catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ error: "AUTH_INVALID_TOKEN" });
    }
}
