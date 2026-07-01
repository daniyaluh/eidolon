import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { getCartItems, postCartItem, deleteCartItem } from "../controllers/cart.controller";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get("/", asyncHandler(getCartItems));
cartRouter.post("/", asyncHandler(postCartItem));
cartRouter.delete("/:gameId", asyncHandler(deleteCartItem));
