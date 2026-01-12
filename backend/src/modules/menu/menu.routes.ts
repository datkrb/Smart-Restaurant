import * as menuController from "./menu.controller";
import { Router } from "express";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";
export const menuRouter = Router();

menuRouter.use(authMiddleware);

// Category routes
menuRouter.post(
  "/categories",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.createCategory
);
menuRouter.get("/categories", menuController.getCategories);
menuRouter.get("/categories/:id", menuController.getCategoryById);
menuRouter.delete(
  "/categories/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteCategoryById
);

// Menu item routes
menuRouter.post(
  "/menu-items",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createMenuItem
);
menuRouter.patch(
  "/menu-items/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.updateMenuItem
);
menuRouter.get(
  "/menu-items/category/:categoryId",
  menuController.getMenuItemsByCategoryId
);
menuRouter.get("/menu-items/:id", menuController.getMenuItemById);
menuRouter.delete(
  "/menu-items/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  menuController.deleteMenuItem
);
menuRouter.post(
  "/modifiers/groups",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createModifierGroup
);
menuRouter.get("/", menuController.getMenuItems);

// 2. Tạo lựa chọn (VD: Size L)
menuRouter.post(
  "/modifiers/options",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.KITCHEN]),
  menuController.createModifierOption
);

export default menuRouter;
