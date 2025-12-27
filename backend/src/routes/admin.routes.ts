import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import * as CategoryController from "../controllers/admin.category.controller";
import * as MenuController from "../controllers/admin.menu.controller";
import * as TableController from "../controllers/admin.table.controller";
//import { getOrders, updateOrderStatus } from "../controllers/admin.order.controller";

const router = Router();
const prisma = new PrismaClient();

// --- CATEGORY ROUTES ---
router.get("/categories", CategoryController.getCategories);
router.post("/categories", CategoryController.createCategory);
router.put("/categories/:id", CategoryController.updateCategory);
router.delete("/categories/:id", CategoryController.deleteCategory);

// --- MENU ITEM ROUTES ---
router.get("/menu-items", MenuController.getMenuItems);
router.post("/menu-items", MenuController.createMenuItem);
router.put("/menu-items/:id", MenuController.updateMenuItem);
router.delete("/menu-items/:id", MenuController.deleteMenuItem);

// --- TABLE ROUTES ---
router.get("/tables", TableController.getTables);
router.post("/tables", TableController.createTable);

// --- ORDER ROUTES ---
//router.get("/orders", getOrders);
//router.patch("/orders/:id/status", updateOrderStatus);

export default router;