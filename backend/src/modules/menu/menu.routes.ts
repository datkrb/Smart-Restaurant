import * as menuController from "./menu.controller";
import * as photoController from "./photo.controller";
import { Router } from "express";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";
import { upload } from "../../middleware/upload";

export const menuRouter = Router();

menuRouter.use(authMiddleware);

// ==================== CATEGORY ROUTES ====================
menuRouter.post(
  "/categories",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.createCategory
);
menuRouter.patch(
  "/categories/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.updateCategory
);
menuRouter.get("/categories", menuController.getCategories);
menuRouter.get("/categories/:id", menuController.getCategoryById);
menuRouter.delete(
  "/categories/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteCategoryById
);

// ==================== MENU ITEM ROUTES ====================
// Get all menu items (with pagination, filter, search)
menuRouter.get("/", menuController.getMenuItems);

// Get menu items by category
menuRouter.get(
  "/menu-items/category/:categoryId",
  menuController.getMenuItemsByCategoryId
);

// Get single menu item by ID
menuRouter.get("/menu-items/:id", menuController.getMenuItemById);

// Create menu item (Admin/Kitchen)
menuRouter.post(
  "/menu-items",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createMenuItem
);

// Update menu item (Admin only)
menuRouter.patch(
  "/menu-items/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.updateMenuItem
);

// Delete menu item (Admin only)
menuRouter.delete(
  "/menu-items/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteMenuItem
);

// ==================== PHOTO ROUTES ====================
// Upload photos for a menu item
menuRouter.post(
  "/menu-items/:itemId/photos",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  upload.array("photos", 5),
  photoController.uploadPhotos
);

// Set primary photo
menuRouter.patch(
  "/photos/set-primary",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  photoController.setPrimaryPhoto
);

// Delete a photo
menuRouter.delete(
  "/photos/:photoId",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  photoController.deletePhoto
);

// ==================== MODIFIER ROUTES ====================
// Create modifier group (Size, Extra, etc.)
menuRouter.post(
  "/modifiers/groups",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createModifierGroup
);

// Create modifier option (Small, Large, etc.)
menuRouter.post(
  "/modifiers/options",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createModifierOption
);

// Update/Delete Modifier Group
menuRouter.patch(
  "/modifiers/groups/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.updateModifierGroup
);
menuRouter.delete(
  "/modifiers/groups/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteModifierGroup
);

// Update/Delete Modifier Option
menuRouter.patch(
  "/modifiers/options/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.updateModifierOption
);
menuRouter.delete(
  "/modifiers/options/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteModifierOption
);

export default menuRouter;
