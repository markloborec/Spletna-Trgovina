"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceCart = void 0;
const cartService_1 = require("../services/cartService");
const priceCart = async (req, res) => {
    try {
        const items = req.body?.items;
        const result = await (0, cartService_1.calculateCart)(items);
        return res.status(200).json(result);
    }
    catch (err) {
        const status = err?.status || 500;
        const error = err?.error || "CART_PRICE_ERROR";
        return res.status(status).json({ error, ...err });
    }
};
exports.priceCart = priceCart;
