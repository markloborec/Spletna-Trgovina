"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsController_1 = require("../controllers/productsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// seznam produktov
router.get("/", productsController_1.getProducts);
// en produkt po ID
router.get("/:id", productsController_1.getProductById);
// ustvarjanje produkta (admin)
router.post("/", authMiddleware_1.authMiddleware, productsController_1.createProduct);
// posodobitev produkta (admin)
router.put("/:id", authMiddleware_1.authMiddleware, productsController_1.updateProduct);
// brisanje produkta (admin)
router.delete("/:id", authMiddleware_1.authMiddleware, productsController_1.deleteProduct);
exports.default = router;
