import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { addToWishlist, removeFromWishlist } from "../controllers/wishlist.controller";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);
wishlistRouter.post("/:gameId", asyncHandler(addToWishlist));
wishlistRouter.delete("/:gameId", asyncHandler(removeFromWishlist));
