import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { login, logout, refresh, register } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/refresh", asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
