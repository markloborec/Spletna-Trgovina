import { Request, Response } from "express";
import { Product } from "../models/Product";
import { isValidObjectId } from "mongoose";

const ALLOWED_TYPES = new Set(["cycles", "equipment", "clothing"]);

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
  };
}

// GET /api/products?type=cycles|equipment|clothing&page=1&pageSize=12&categoryId=...&priceMin=...&priceMax=...
export const getProducts = async (req: Request, res: Response) => {
  try {
    // -----------------------
    // PAGINACIJA
    // -----------------------
    const pageRaw = parseInt(req.query.page as string, 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

    const pageSizeRaw = parseInt(req.query.pageSize as string, 10);
    const pageSizeCandidate =
      Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? pageSizeRaw : 12;
    const pageSize = Math.min(pageSizeCandidate, 50);

    const skip = (page - 1) * pageSize;

    // -----------------------
    // FILTRI
    // -----------------------
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
      if (
        priceMin !== undefined &&
        priceMax !== undefined &&
        priceMin > priceMax
      ) {
        return res.status(400).json({ error: "PRODUCT_PRICE_RANGE_INVALID" });
      }

      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = priceMin;
      if (priceMax !== undefined) filter.price.$lte = priceMax;
    }

    // -----------------------
    // SORT
    // -----------------------
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

    const sort = sortParam ? sortOptions[sortParam] : { name: 1 }; // default


    // -----------------------
    // QUERY
    // -----------------------
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ]);

    // -----------------------
    // RESPONSE
    // -----------------------
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

// POST /api/products (admin only) — admin check je v adminMiddleware
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
    } = req.body;

    // obvezna polja
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "PRODUCT_NAME_REQUIRED" });
    }

    // price mora biti number (ne string) in >= 0
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

    // category je optional, ampak če je podan mora biti valid
    if (category !== undefined && category !== null && category !== "") {
      if (typeof category !== "string" || !isValidObjectId(category)) {
        return res.status(400).json({ error: "PRODUCT_CATEGORY_INVALID" });
      }
    }

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
    });

    return res.status(201).json(toApiProduct(created));
  } catch (err) {
    console.error("PRODUCT_CREATE_ERROR:", err);
    return res.status(500).json({ error: "PRODUCT_CREATE_ERROR" });
  }
};

// PUT /api/products/:id (admin only) — admin check je v adminMiddleware
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
      // omogočimo tudi “brisanje” kategorije (null/"")
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

// DELETE /api/products/:id (admin only) — admin check je v adminMiddleware
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
import { ProductVariant } from "../models/ProductVariant"; // dodaj na vrh, če ga še nimaš

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

