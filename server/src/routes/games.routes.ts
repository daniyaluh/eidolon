import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getGames, getGameDetail } from "../controllers/games.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import { postReview, getReviews, getMyReview } from "../controllers/review.controller";

export const gamesRouter = Router();

gamesRouter.get("/", asyncHandler(getGames));

// Review sub-routes (keyed by game id) are declared before the :slug detail
// route so "reviews" is never mistaken for a slug.
gamesRouter.get("/:id/reviews", optionalAuth, asyncHandler(getReviews));
gamesRouter.get("/:id/reviews/mine", requireAuth, asyncHandler(getMyReview));
gamesRouter.post("/:id/reviews", requireAuth, asyncHandler(postReview));

gamesRouter.get("/:slug", asyncHandler(getGameDetail));
