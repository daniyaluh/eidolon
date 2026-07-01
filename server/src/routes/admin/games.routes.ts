import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware";
import { createGame, updateGame, deleteGame } from "../../controllers/admin/games.controller";
import { uploadCover, uploadScreenshot } from "../../controllers/admin/upload.controller";
import { imageUpload } from "../../middleware/upload.middleware";

export const adminGamesRouter = Router();

adminGamesRouter.use(requireAuth, requireAdmin);

adminGamesRouter.post("/", asyncHandler(createGame));
adminGamesRouter.patch("/:id", asyncHandler(updateGame));
adminGamesRouter.delete("/:id", asyncHandler(deleteGame));

adminGamesRouter.post(
  "/:id/upload-cover",
  imageUpload.single("file"),
  asyncHandler(uploadCover)
);
adminGamesRouter.post(
  "/:id/upload-screenshot",
  imageUpload.single("file"),
  asyncHandler(uploadScreenshot)
);
