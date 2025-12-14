import { Request, Response } from "express";
import { Product } from "../models/Product";
import { isValidObjectId } from "mongoose";

const ALLOWED_TYPES = new Set(["cycles", "equipment", "clothing"]);

const toApiProduct = (p: any) => ({
  id: p._id.toString(),
  name: p.name,
  price: p.price,

  // backend snake_case -> frontend camelCase
  imageUrl: p.image_url ?? "",
  shortDescription: p.short_description ?? "",
  longDescription: p.long_description ?? "",

  type: p.type,

  // backend inStock -> frontend isAvailable
  isAvailable: Boolean(p.inStock),

  // new fields (stored or default)
  warrantyMonths: typeof p.warrantyMonths === "number" ? p.warrantyMonths : 24,
  officialProductSite: p.officialProductSite ?? undefined,
});

// GET /api/products?type=cycles|equipment|clothing&page=1&pageSize=12
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 12;

    const type = (req.query.type as string | undefined)?.toLowerCase();
    if (type && !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({
        errorCode: "PRODUCT_TYPE_INVALID",
        allowed: Array.from(ALLOWED_TYPES),
      });
    }

    const skip = (page - 1) * pageSize;

    const filter: any = {};
    if (type) filter.type = type;

    const [items, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      items: items.map(toApiProduct),
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({ errorCode: "PRODUCT_ID_INVALID" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ errorCode: "PRODUCT_NOT_FOUND" });
    }

    return res.json(toApiProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorCode: "PRODUCT_DETAIL_ERROR" });
  }
};
