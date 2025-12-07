import { Request, Response } from "express";
import { Category } from "../models/Category";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().lean();

    return res.json(
      categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorCode: "CATEGORY_LIST_ERROR" });
  }
};
