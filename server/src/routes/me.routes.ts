import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { imageUpload } from "../middleware/upload.middleware";
import {
  getMe,
  updateMe,
  uploadAvatar,
  getMyLibrary,
  getMyOrders,
} from "../controllers/me.controller";
import { getWishlist } from "../controllers/wishlist.controller";

export const meRouter = Router();

meRouter.use(requireAuth);
meRouter.get("/", asyncHandler(getMe));
meRouter.patch("/", asyncHandler(updateMe));
meRouter.post("/avatar", imageUpload.single("file"), asyncHandler(uploadAvatar));
meRouter.get("/library", asyncHandler(getMyLibrary));
meRouter.get("/orders", asyncHandler(getMyOrders));
meRouter.get("/wishlist", asyncHandler(getWishlist));
