import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { postHelpful } from "../controllers/review.controller";

export const reviewsRouter = Router();

reviewsRouter.post("/:id/helpful", requireAuth, asyncHandler(postHelpful));
