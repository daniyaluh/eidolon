import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware";
import { getAnalytics } from "../../controllers/admin/analytics.controller";

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.use(requireAuth, requireAdmin);
adminAnalyticsRouter.get("/", asyncHandler(getAnalytics));
