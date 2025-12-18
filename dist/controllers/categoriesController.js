"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const Category_1 = require("../models/Category");
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.Category.find().lean();
        return res.json(categories.map((c) => ({
            id: c._id.toString(),
            name: c.name,
        })));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "CATEGORY_LIST_ERROR" });
    }
};
exports.getCategories = getCategories;
