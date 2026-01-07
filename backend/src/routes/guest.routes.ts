import { Router } from "express";
import { startSession, getCategories, getMenuItems } from "../controllers/guest.controller";
import { createOrder } from "../controllers/order.controller";

const router = Router();

// POST /api/guest/session -> Gửi { tableId: "..." } để bắt đầu
router.post("/session", startSession);

// Route cho Menu Page 
router.get("/categories", getCategories);
router.get("/menu-items", getMenuItems);

router.post("/orders", createOrder);

export default router;