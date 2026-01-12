import { Router } from "express";
import categoryRoutes from "../category/category.routes";
import menuRoutes from "../menu/menu.routes";
import tableRoutes from "../table/table.routes";
import * as AdminOrderController from "../order/admin-order.controller";

const router = Router();

// --- CATEGORY ROUTES ---
router.use("/categories", categoryRoutes);

// --- MENU ROUTES (includes menu-items, photos, modifiers) ---
router.use("/menu", menuRoutes);

// --- TABLE ROUTES ---
router.use("/tables", tableRoutes);

// --- ORDER ROUTES ---
router.get("/orders", AdminOrderController.getOrders);
router.patch("/orders/:id/status", AdminOrderController.updateOrderStatus);

export default router;
