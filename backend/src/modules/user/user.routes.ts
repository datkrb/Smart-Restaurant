import { Router } from "express";
import multer from "multer";
import path from "path";
import * as userController from "./user.controller";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// all apis below are protected
router.use(authMiddleware);

// Profile routes (accessible by all authenticated users)
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.patch("/profile/password", userController.changePassword);
router.post("/profile/avatar", upload.single("avatar"), userController.uploadAvatar);
router.get("/profile/orders", userController.getOrderHistory);

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
