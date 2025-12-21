"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsController_1 = require("../controllers/productsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// public
router.get("/", productsController_1.getProducts);
router.get("/:id/variants", productsController_1.getProductVariants); // <-- DODANO, MORA BITI TU
router.get("/:id", productsController_1.getProductById);
// admin-only
router.post("/", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, productsController_1.createProduct);
router.put("/:id", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, productsController_1.updateProduct);
router.delete("/:id", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, productsController_1.deleteProduct);
exports.default = router;
