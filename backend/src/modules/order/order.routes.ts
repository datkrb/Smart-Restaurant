import { Router } from "express";
import * as OrderController from "./order.controller";

const router = Router();

// ==================== ORDER ROUTES ====================

// Create new order (Guest creates from cart)
router.post("/", OrderController.createOrder);

// Get order by session ID
router.get("/session/:sessionId", OrderController.getOrderBySession);

export default router;
