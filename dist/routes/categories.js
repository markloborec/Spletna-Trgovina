"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriesController_1 = require("../controllers/categoriesController");
const router = (0, express_1.Router)();
router.get("/", categoriesController_1.getCategories);
exports.default = router;
