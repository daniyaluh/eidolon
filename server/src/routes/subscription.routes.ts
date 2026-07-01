import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { cancelSubscription } from "../controllers/subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.use(requireAuth);
subscriptionRouter.delete("/:id", asyncHandler(cancelSubscription));
