import { Request, Response } from "express";
import { Product } from "../models/Product";
import { isValidObjectId } from "mongoose";
import { ProductVariant } from "../models/ProductVariant";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import { Review } from "../models/Review";
import { Order } from "../models/Order";

const ALLOWED_TYPES = new Set(["cycles", "equipment", "clothing"]);

function normalizeCompatibility(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    // podpira "MTB, Road" ali "MTB"
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function toApiProduct(p: any) {
  return {
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

    warrantyMonths: typeof p.warrantyMonths === "number" ? p.warrantyMonths : 24,
    officialProductSite: p.officialProductSite || undefined,

    brand: p.brand ?? undefined,
    material: p.material ?? undefined,
    weight: typeof p.weight === "number" ? p.weight : undefined,
    compatibility: Array.isArray(p.compatibility) ? p.compatibility : [],

    // ratings
    ratingAvg: typeof p.ratingAvg === "number" ? p.ratingAvg : 0,
    ratingCount: typeof p.ratingCount === "number" ? p.ratingCount : 0,
  };
}

function toApiReview(r: any) {
  return {
    id: r._id.toString(),
    productId: r.product_id.toString(),
    userId: r.user_id.toString(),
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt,
  };
}

// GET /api/products?type=cycles|equipment|clothing&page=1&pageSize=12&categoryId=...&priceMin=...&priceMax=...
export const getProducts = async (req: Request, res: Response) => {
  try {
    const pageRaw = parseInt(req.query.page as string, 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

    const pageSizeRaw = parseInt(req.query.pageSize as string, 10);
    const pageSizeCandidate = Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? pageSizeRaw : 12;
    const pageSize = Math.min(pageSizeCandidate, 50);

    const skip = (page - 1) * pageSize;

    const type = (req.query.type as string | undefined)?.toLowerCase();
    if (type && !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({
        error: "PRODUCT_TYPE_INVALID",
        allowed: Array.from(ALLOWED_TYPES),
      });
    }

    const categoryId = req.query.categoryId as string | undefined;

    const priceMinRaw = req.query.priceMin as string | undefined;
    const priceMaxRaw = req.query.priceMax as string | undefined;

    const priceMin = priceMinRaw !== undefined ? Number(priceMinRaw) : undefined;
    const priceMax = priceMaxRaw !== undefined ? Number(priceMaxRaw) : undefined;

    const filter: any = {};

    if (type) filter.type = type;

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
      }
      filter.category = categoryId;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      if (priceMin !== undefined && (Number.isNaN(priceMin) || priceMin < 0)) {
        return res.status(400).json({ error: "PRODUCT_PRICE_MIN_INVALID" });
      }
      if (priceMax !== undefined && (Number.isNaN(priceMax) || priceMax < 0)) {
        return res.status(400).json({ error: "PRODUCT_PRICE_MAX_INVALID" });
      }
      if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
        return res.status(400).json({ error: "PRODUCT_PRICE_RANGE_INVALID" });
      }

      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = priceMin;
      if (priceMax !== undefined) filter.price.$lte = priceMax;
    }

    const sortParam = (req.query.sort as string | undefined)?.toLowerCase();
    const sortOptions: Record<string, any> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    if (sortParam && !sortOptions[sortParam]) {
      return res.status(400).json({
        error: "PRODUCT_SORT_INVALID",
        allowed: Object.keys(sortOptions),
      });
    }

    const sort = sortParam ? sortOptions[sortParam] : { name: 1 };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(toApiProduct),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("PRODUCT_LIST_ERROR:", err);
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

    return res.status(200).json(toApiProduct(product));
  } catch (err) {
    console.error("PRODUCT_DETAIL_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_DETAIL_ERROR" });
  }
};

// POST /api/products (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
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
      material,
      weight,
      compatibility,
    } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "PRODUCT_NAME_REQUIRED" });
    }

    if (price === undefined || typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "PRODUCT_PRICE_INVALID" });
    }

    if (typeof type !== "string") {
      return res.status(400).json({ error: "PRODUCT_TYPE_REQUIRED" });
    }

    const normalizedType = type.toLowerCase();
    if (!ALLOWED_TYPES.has(normalizedType)) {
      return res.status(400).json({
        error: "PRODUCT_TYPE_INVALID",
        allowed: Array.from(ALLOWED_TYPES),
      });
    }

    if (category !== undefined && category !== null && category !== "") {
      if (typeof category !== "string" || !isValidObjectId(category)) {
        return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
      }
    }

    if (material !== undefined && material !== null && typeof material !== "string") {
      return res.status(400).json({ error: "PRODUCT_MATERIAL_INVALID" });
    }

    if (weight !== undefined && weight !== null) {
      if (typeof weight !== "number" || Number.isNaN(weight) || weight < 0) {
        return res.status(400).json({ error: "PRODUCT_WEIGHT_INVALID" });
      }
    }

    const compatArr = normalizeCompatibility(compatibility);

    const created = await Product.create({
      name: name.trim(),
      price,
      type: normalizedType,
      category: category ? category : undefined,

      short_description: typeof shortDescription === "string" ? shortDescription : "",
      long_description: typeof longDescription === "string" ? longDescription : "",

      brand: typeof brand === "string" ? brand : "",
      image_url: typeof imageUrl === "string" ? imageUrl : "",

      inStock: typeof inStock === "boolean" ? inStock : true,
      warrantyMonths: typeof warrantyMonths === "number" ? warrantyMonths : 24,
      officialProductSite: typeof officialProductSite === "string" ? officialProductSite : undefined,

      material: typeof material === "string" ? material : "",
      weight: typeof weight === "number" ? weight : undefined,
      compatibility: compatArr,
    });

    return res.status(201).json(toApiProduct(created));
  } catch (err) {
    console.error("PRODUCT_CREATE_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_CREATE_ERROR" });
  }
};

// PUT /api/products/:id (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
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
      material,
      weight,
      compatibility,
    } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "PRODUCT_NAME_INVALID" });
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(400).json({ error: "PRODUCT_PRICE_INVALID" });
      }
      updateData.price = price;
    }

    if (type !== undefined) {
      if (typeof type !== "string") {
        return res.status(400).json({ error: "PRODUCT_TYPE_INVALID" });
      }
      const normalizedType = type.toLowerCase();
      if (!ALLOWED_TYPES.has(normalizedType)) {
        return res.status(400).json({
          error: "PRODUCT_TYPE_INVALID",
          allowed: Array.from(ALLOWED_TYPES),
        });
      }
      updateData.type = normalizedType;
    }

    if (category !== undefined) {
      if (category === null || category === "") {
        updateData.category = undefined;
      } else {
        if (typeof category !== "string" || !isValidObjectId(category)) {
          return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
        }
        updateData.category = category;
      }
    }

    if (shortDescription !== undefined) {
      if (typeof shortDescription !== "string") {
        return res.status(400).json({ error: "PRODUCT_SHORT_DESCRIPTION_INVALID" });
      }
      updateData.short_description = shortDescription;
    }

    if (longDescription !== undefined) {
      if (typeof longDescription !== "string") {
        return res.status(400).json({ error: "PRODUCT_LONG_DESCRIPTION_INVALID" });
      }
      updateData.long_description = longDescription;
    }

    if (brand !== undefined) {
      if (typeof brand !== "string") {
        return res.status(400).json({ error: "PRODUCT_BRAND_INVALID" });
      }
      updateData.brand = brand;
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        return res.status(400).json({ error: "PRODUCT_IMAGE_URL_INVALID" });
      }
      updateData.image_url = imageUrl;
    }

    if (inStock !== undefined) {
      if (typeof inStock !== "boolean") {
        return res.status(400).json({ error: "PRODUCT_INSTOCK_INVALID" });
      }
      updateData.inStock = inStock;
    }

    if (warrantyMonths !== undefined) {
      if (typeof warrantyMonths !== "number" || warrantyMonths < 0) {
        return res.status(400).json({ error: "PRODUCT_WARRANTY_INVALID" });
      }
      updateData.warrantyMonths = warrantyMonths;
    }

    if (officialProductSite !== undefined) {
      if (officialProductSite === null || officialProductSite === "") {
        updateData.officialProductSite = undefined;
      } else {
        if (typeof officialProductSite !== "string") {
          return res.status(400).json({ error: "PRODUCT_SITE_INVALID" });
        }
        updateData.officialProductSite = officialProductSite;
      }
    }

    if (material !== undefined) {
      if (material === null || material === "") updateData.material = undefined;
      else {
        if (typeof material !== "string") return res.status(400).json({ error: "PRODUCT_MATERIAL_INVALID" });
        updateData.material = material;
      }
    }

    if (weight !== undefined) {
      if (weight === null || weight === "") updateData.weight = undefined;
      else {
        if (typeof weight !== "number" || Number.isNaN(weight) || weight < 0) {
          return res.status(400).json({ error: "PRODUCT_WEIGHT_INVALID" });
        }
        updateData.weight = weight;
      }
    }

    if (compatibility !== undefined) {
      updateData.compatibility = normalizeCompatibility(compatibility);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "PRODUCT_UPDATE_NO_FIELDS" });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    return res.status(200).json(toApiProduct(updated));
  } catch (err) {
    console.error("PRODUCT_UPDATE_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_UPDATE_ERROR" });
  }
};

// DELETE /api/products/:id (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const deleted = await Product.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("PRODUCT_DELETE_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_DELETE_ERROR" });
  }
};

// GET /api/products/:id/variants
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const variants = await ProductVariant.find({ product: id })
      .select("_id variant_name sku stock_quantity extra_price product")
      .lean();

    return res.status(200).json({
      items: variants.map((v: any) => ({
        id: v._id.toString(),
        productId: v.product.toString(),
        variantName: v.variant_name,
        sku: v.sku ?? "",
        stockQuantity: typeof v.stock_quantity === "number" ? v.stock_quantity : 0,
        extraPrice: typeof v.extra_price === "number" ? v.extra_price : 0,
      })),
    });
  } catch (err) {
    console.error("PRODUCT_VARIANTS_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_VARIANTS_ERROR" });
  }
};

// GET /api/products/:id/reviews
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const reviews = await Review.find({ product_id: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ items: reviews.map(toApiReview) });
  } catch (err) {
    console.error("PRODUCT_REVIEWS_LIST_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_REVIEWS_LIST_ERROR" });
  }
};

// POST /api/products/:id/reviews (auth)
export const createProductReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "AUTH_REQUIRED" });
    }

    const { id } = req.params; // product id
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "PRODUCT_ID_INVALID" });
    }

    const ratingRaw = req.body?.rating;
    const commentRaw = req.body?.comment;

    const rating = Number(ratingRaw);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "REVIEW_RATING_INVALID" });
    }

    const comment = typeof commentRaw === "string" ? commentRaw.trim() : "";
    if (comment.length > 500) {
      return res.status(400).json({ error: "REVIEW_COMMENT_TOO_LONG" });
    }

    // must be purchased by this user (and not cancelled)
    const hasPurchased = await Order.exists({
      user_id: req.user.id,
      status: { $ne: "cancelled" },
      "items.productId": id,
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: "REVIEW_NOT_PURCHASED" });
    }

    // ensure product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    // one review per user per product
    const already = await Review.findOne({ user_id: req.user.id, product_id: id }).lean();
    if (already) {
      return res.status(409).json({ error: "REVIEW_ALREADY_EXISTS" });
    }

    const review = await Review.create({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      product_id: new mongoose.Types.ObjectId(id),
      rating,
      comment,
    });

    // update denormalized rating stats
    const prevCount = typeof (product as any).ratingCount === "number" ? (product as any).ratingCount : 0;
    const prevAvg = typeof (product as any).ratingAvg === "number" ? (product as any).ratingAvg : 0;
    const nextCount = prevCount + 1;
    const nextAvg = (prevAvg * prevCount + rating) / nextCount;

    (product as any).ratingCount = nextCount;
    (product as any).ratingAvg = Math.round(nextAvg * 100) / 100; // 2 decimals
    await product.save();

    return res.status(201).json({ review: toApiReview(review), product: toApiProduct(product) });
  } catch (err: any) {
    // unique index violation
    if (err?.code === 11000) {
      return res.status(409).json({ error: "REVIEW_ALREADY_EXISTS" });
    }
    console.error("PRODUCT_REVIEW_CREATE_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_REVIEW_CREATE_ERROR" });
  }
};
