import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { AuthRequest } from "../middleware/authMiddleware";

async function recalcProductRating(productId: string) {
  const pid = new Types.ObjectId(productId);

  const agg = await Review.aggregate([
    { $match: { product_id: pid } },
    {
      $group: {
        _id: "$product_id",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = agg.length ? Number(agg[0].avg.toFixed(2)) : 0;
  const count = agg.length ? agg[0].count : 0;

  await Product.updateOne(
    { _id: pid },
    { $set: { ratingAvg: avg, ratingCount: count } }
  );
}

export async function listProductReviews(req: Request, res: Response) {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) return res.status(400).json({ error: "INVALID_PRODUCT_ID" });

  const pid = new Types.ObjectId(productId);

  const reviews = await Review.find({ product_id: pid })
    .sort({ createdAt: -1 })
    .populate("user_id", "email")
    .lean();

  return res.json({
    ok: true,
    items: reviews.map((r: any) => ({
      id: r._id.toString(),
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: r.user_id ? { id: r.user_id._id.toString(), email: r.user_id.email } : null,
    })),
  });
}

export async function addOrUpdateReview(req: AuthRequest, res: Response) {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) return res.status(400).json({ error: "INVALID_PRODUCT_ID" });
  if (!req.user?.id) return res.status(401).json({ error: "AUTH_REQUIRED" });

  const { rating, comment } = req.body ?? {};
  const rNum = Number(rating);

  if (!Number.isFinite(rNum) || rNum < 1 || rNum > 5) {
    return res.status(400).json({ error: "INVALID_RATING" });
  }
  if (typeof comment !== "string" || comment.trim().length < 3) {
    return res.status(400).json({ error: "INVALID_COMMENT" });
  }

  const product = await Product.findById(productId).lean();
  if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });

  const pid = new Types.ObjectId(productId);
  const uid = new Types.ObjectId(req.user.id);

  const saved = await Review.findOneAndUpdate(
    { product_id: pid, user_id: uid },
    { $set: { rating: rNum, comment: comment.trim() } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  await recalcProductRating(productId);

  return res.status(201).json({
    ok: true,
    item: {
      id: (saved as any)._id.toString(),
      rating: (saved as any).rating,
      comment: (saved as any).comment,
    },
  });
}

export async function deleteReview(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "INVALID_REVIEW_ID" });
  if (!req.user?.id) return res.status(401).json({ error: "AUTH_REQUIRED" });

  const review = await Review.findById(id).lean();
  if (!review) return res.status(404).json({ error: "REVIEW_NOT_FOUND" });

  const isOwner = review.user_id.toString() === req.user.id;
  const isAdmin = !!req.user.is_admin;
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "FORBIDDEN" });

  await Review.deleteOne({ _id: id });
  await recalcProductRating(review.product_id.toString());

  return res.json({ ok: true });
}
