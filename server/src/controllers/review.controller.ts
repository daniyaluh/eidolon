import { Request, Response } from "express";
import { reviewInputSchema, listReviewsQuerySchema } from "../validators/review.validator";
import {
  ReviewError,
  upsertReview,
  listReviews,
  voteHelpful,
  getMyReviewForGame,
} from "../services/review.service";

export async function postReview(req: Request, res: Response) {
  const parsed = reviewInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid review", details: parsed.error.flatten() });
  }

  try {
    const review = await upsertReview(req.user!.id, req.params.id, parsed.data);
    return res.status(201).json(review);
  } catch (err) {
    if (err instanceof ReviewError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function getReviews(req: Request, res: Response) {
  const parsed = listReviewsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
  }

  const result = await listReviews(req.params.id, {
    sort: parsed.data.sort,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    currentUserId: req.user?.id,
  });

  return res.json(result);
}

export async function getMyReview(req: Request, res: Response) {
  const review = await getMyReviewForGame(req.user!.id, req.params.id);
  return res.json({ review });
}

export async function postHelpful(req: Request, res: Response) {
  try {
    const result = await voteHelpful(req.user!.id, req.params.id);
    return res.json(result);
  } catch (err) {
    if (err instanceof ReviewError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}
