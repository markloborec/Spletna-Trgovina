"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jwt_1 = require("../utils/jwt");
// ✅ Obvezen auth (npr. /orders/my, /orders/:id)
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "AUTH_MISSING_TOKEN" });
        }
        const token = authHeader.split(" ")[1];
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            is_admin: payload.is_admin === true,
        };
        next();
    }
    catch (err) {
        console.error("AUTH_ERROR:", err);
        return res.status(401).json({ error: "AUTH_INVALID_TOKEN" });
    }
}
function optionalAuthMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const payload = (0, jwt_1.verifyToken)(token);
            req.user = {
                id: payload.userId,
                email: payload.email,
                is_admin: payload.is_admin === true,
            };
        }
        next();
    }
    catch (err) {
        // če je token slab, nadaljuj kot guest
        next();
    }
}
