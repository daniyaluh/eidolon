import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { postCreateSession, postConfirmSession } from "../controllers/checkout.controller";

export const checkoutRouter = Router();

checkoutRouter.use(requireAuth);
checkoutRouter.post("/create-session", asyncHandler(postCreateSession));
checkoutRouter.post("/confirm", asyncHandler(postConfirmSession));
