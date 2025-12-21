"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "AUTH_REQUIRED" });
    }
    if (req.user.is_admin !== true) {
        return res.status(403).json({ error: "ADMIN_ONLY" });
    }
    next();
}
