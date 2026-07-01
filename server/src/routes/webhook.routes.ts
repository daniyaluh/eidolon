import { Router, raw } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { handleStripeWebhook } from "../controllers/webhook.controller";

export const webhookRouter = Router();

// Stripe requires the raw, unparsed body to verify the signature.
webhookRouter.post("/stripe", raw({ type: "application/json" }), asyncHandler(handleStripeWebhook));
