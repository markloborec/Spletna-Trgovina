import { Request, Response } from "express";
import { Product } from "../models/Product";
import { isValidObjectId } from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";

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
        error: "PRODUCT_TYPE_INVALID",
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
    return res.status(500).json({ error: "PRODUCT_LIST_ERROR" });
  }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    return res.json(toApiProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "PRODUCT_DETAIL_ERROR" });
  }
};

// POST /api/products  (admin only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // 1) admin check
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "PRODUCT_ADMIN_ONLY" });
    }

    const {
      name,
      price,
      type,
      category,
      shortDescription,
      longDescription,
      brand,
      imageUrl,
      inStock,
      warrantyMonths,
      officialProductSite,
    } = req.body;

    // 2) obvezna polja
    if (!name || !price || !type || !category) {
      return res.status(400).json({ error: "PRODUCT_MISSING_FIELDS" });
    }

    // 3) validacija type
    const normalizedType = String(type).toLowerCase();
    if (!ALLOWED_TYPES.has(normalizedType)) {
      return res.status(400).json({
        error: "PRODUCT_TYPE_INVALID",
        allowed: Array.from(ALLOWED_TYPES),
      });
    }

    // 4) validacija category ID
    if (!isValidObjectId(category)) {
      return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
    }

    // 5) priprava podatkov za Mongo (match na schema field names)
    const product = await Product.create({
      name,
      price,
      type: normalizedType,
      category,
      short_description: shortDescription ?? "",
      long_description: longDescription ?? "",
      brand: brand ?? "",
      image_url: imageUrl ?? "",
      inStock: typeof inStock === "boolean" ? inStock : true,
      warrantyMonths: typeof warrantyMonths === "number" ? warrantyMonths : 24,
      officialProductSite: officialProductSite ?? "",
    });

    return res.status(201).json(toApiProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "PRODUCT_CREATE_ERROR" });
  }
};

// PUT /api/products/:id  (admin only)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "PRODUCT_ADMIN_ONLY" });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const {
      name,
      price,
      type,
      category,
      shortDescription,
      longDescription,
      brand,
      imageUrl,
      inStock,
      warrantyMonths,
      officialProductSite,
    } = req.body;

    const updateData: any = {};

    if (typeof name === "string") updateData.name = name;
    if (typeof price === "number") updateData.price = price;

    if (typeof type === "string") {
      const normalizedType = type.toLowerCase();
      if (!ALLOWED_TYPES.has(normalizedType)) {
        return res.status(400).json({
          error: "PRODUCT_TYPE_INVALID",
          allowed: Array.from(ALLOWED_TYPES),
        });
      }
      updateData.type = normalizedType;
    }

    if (typeof category === "string") {
      if (!isValidObjectId(category)) {
        return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
      }
      updateData.category = category;
    }

    if (typeof shortDescription === "string") {
      updateData.short_description = shortDescription;
    }

    if (typeof longDescription === "string") {
      updateData.long_description = longDescription;
    }

    if (typeof brand === "string") updateData.brand = brand;
    if (typeof imageUrl === "string") updateData.image_url = imageUrl;

    if (typeof inStock === "boolean") updateData.inStock = inStock;

    if (typeof warrantyMonths === "number") {
      updateData.warrantyMonths = warrantyMonths;
    }

    if (typeof officialProductSite === "string") {
      updateData.officialProductSite = officialProductSite;
    }

    // če ni niti enega polja, ki bi ga posodobili
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "PRODUCT_UPDATE_NO_FIELDS" });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    return res.json(toApiProduct(updated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "PRODUCT_UPDATE_ERROR" });
  }
};

// DELETE /api/products/:id  (admin only)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "PRODUCT_ADMIN_ONLY" });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "PRODUCT_DELETE_ERROR" });
  }
};

