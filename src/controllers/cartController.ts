import { Request, Response } from "express";
import { calculateCart } from "../services/cartService";

export const priceCart = async (req: Request, res: Response) => {
  try {
    const items = req.body?.items;
    const result = await calculateCart(items);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err?.status || 500;
    const error = err?.error || "CART_PRICE_ERROR";
    return res.status(status).json({ error, ...err });
  }
};
