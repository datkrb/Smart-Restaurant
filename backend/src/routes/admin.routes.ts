import { Router } from "express";
//import { getOrders, updateOrderStatus } from "../controllers/admin.order.controller";
import * as CategoryController from "../controllers/admin.category.controller";
import * as MenuController from "../controllers/admin.menu.controller";
import * as TableController from "../controllers/admin.table.controller";

const router = Router();

// --- CATEGORY ROUTES (Phase 2) ---
router.get("/categories", CategoryController.getCategories);
router.post("/categories", CategoryController.createCategory);
router.put("/categories/:id", CategoryController.updateCategory);
router.delete("/categories/:id", CategoryController.deleteCategory);

// --- MENU ITEM ROUTES (Phase 2) ---
router.get("/menu-items", MenuController.getMenuItems);
router.post("/menu-items", MenuController.createMenuItem);
router.put("/menu-items/:id", MenuController.updateMenuItem);
router.delete("/menu-items/:id", MenuController.deleteMenuItem);

// --- TABLE ROUTES (Phase 2) ---
router.get("/tables", TableController.getTables);
router.post("/tables", TableController.createTable);

export default router;