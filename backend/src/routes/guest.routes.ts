import { Router } from "express";
import { startSession, getGuestMenu } from "../controllers/guest.controller";
import { createOrder } from "../controllers/order.controller";

const router = Router();

// POST /api/guest/session -> Gửi { tableId: "..." } để bắt đầu
router.post("/session", startSession);

// GET /api/guest/menu -> Lấy menu để hiển thị
router.get("/menu", getGuestMenu);

router.post("/orders", createOrder);

export default router;