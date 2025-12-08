import { Request, Response } from "express";
import { Product } from "../models/Product";
import { isValidObjectId } from "mongoose";

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 12;

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      Product.find().skip(skip).limit(pageSize).lean(),
      Product.countDocuments(),
    ]);

    return res.json({
      items: items.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price,
        brand: p.brand,
        image_url: p.image_url,
        short_description: p.short_description,
        categoryId: p.category?.toString(),
        inStock: p.inStock,
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorCode: "PRODUCT_LIST_ERROR" });
  }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // invalid ObjectId (npr. "abc")
    if (!isValidObjectId(id)) {
      return res.status(400).json({ errorCode: "PRODUCT_ID_INVALID" });
    }

    // poiščemo produkt v bazi
    const product = await Product.findById(id).lean();

    // če ga ni
    if (!product) {
      return res.status(404).json({ errorCode: "PRODUCT_NOT_FOUND" });
    }

    // če ga najdemo, vrnemo podatke v lepem formatu
    return res.json({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      categoryId: product.category?.toString(),
      brand: product.brand,
      inStock: product.inStock,
      short_description: product.short_description,
      long_description: product.long_description,
      image_url: product.image_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorCode: "PRODUCT_DETAIL_ERROR" });
  }
};
