import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware";
import { listUsers, updateUserRole, deleteUser } from "../../controllers/admin/users.controller";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth, requireAdmin);
adminUsersRouter.get("/", asyncHandler(listUsers));
adminUsersRouter.patch("/:id/role", asyncHandler(updateUserRole));
adminUsersRouter.delete("/:id", asyncHandler(deleteUser));
