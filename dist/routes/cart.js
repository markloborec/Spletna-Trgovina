"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const router = (0, express_1.Router)();
router.post("/price", cartController_1.priceCart);
exports.default = router;
