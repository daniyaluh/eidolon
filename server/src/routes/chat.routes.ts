import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { createSession, postMessage } from "../controllers/chat.controller";

export const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.post("/sessions", asyncHandler(createSession));
chatRouter.post("/sessions/:id/messages", asyncHandler(postMessage));
