"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const usersController_1 = require("../controllers/usersController");
const usersRouter = (0, express_1.Router)();
// PUT /api/users/me
usersRouter.put("/me", authMiddleware_1.authMiddleware, usersController_1.updateMe);
exports.default = usersRouter;
