import { Router } from "express";
import { startSession, getCategories, getMenuItems, getOrderDetails, requestBill } from "../controllers/guest.controller";
import { createOrder } from "../controllers/order.controller";

const router = Router();

// POST /api/guest/session -> Gửi { tableId: "..." } để bắt đầu
router.post("/session", startSession);

// Route cho Menu Page 
router.get("/categories", getCategories);
router.get("/menu-items", getMenuItems);

router.post("/orders", createOrder);
router.get("/orders/:tableSessionId", getOrderDetails);
router.post("/orders/:orderId/request-bill", requestBill);

export default router;