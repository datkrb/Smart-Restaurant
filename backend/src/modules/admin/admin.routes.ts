import { Router } from "express";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

// Import routes from other modules
import categoryRoutes from "../category/category.routes";
import menuRoutes from "../menu/menu.routes";
import tableRoutes from "../table/table.routes";
import * as AdminOrderController from "../order/admin-order.controller";

const router = Router();

// ==================== AUTH MIDDLEWARE ====================
// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleGuard([Role.ADMIN, Role.SUPER_ADMIN]));

// ==================== CATEGORY ROUTES ====================
router.use("/categories", categoryRoutes);

// ==================== MENU ROUTES ====================
// Includes: menu-items, photos, modifiers, categories
router.use("/menu", menuRoutes);

// ==================== TABLE ROUTES ====================
router.use("/tables", tableRoutes);

// ==================== ORDER ROUTES ====================
router.get("/orders", AdminOrderController.getOrders);
router.patch("/orders/:id/status", AdminOrderController.updateOrderStatus);

export default router;
