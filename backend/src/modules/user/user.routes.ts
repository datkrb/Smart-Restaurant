import { Router } from "express";
import * as userController from "./user.controller";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// all apis below are protected
router.use(authMiddleware);

// Create a new user (Only Admin and Super Admin)
router.post(
  "/",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.createUser
);

// Get all users (Only Admin and Super Admin)
router.get(
  "/",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.getAllUsers
);

// Activate or Deactivate User (Only Admin and Super Admin)
router.patch(
  "/:id/status",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.updateUserStatus
);

// Update User (Only Admin and Super Admin)
router.patch(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.updateUser
);

// Delete User (Only Admin and Super Admin)
router.delete(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  userController.deleteUser
);

export default router;
