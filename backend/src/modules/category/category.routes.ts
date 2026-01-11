import { Router } from "express";
import * as CategoryController from "./category.controller";

const router = Router();

// --- CATEGORY ROUTES ---
router.get("/", CategoryController.getCategories);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
