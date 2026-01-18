import { Router } from "express";
import * as OrderController from "./order.controller";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// ==================== ORDER ROUTES ====================

// Guest: Create new order
router.post("/", OrderController.createOrder);

// Guest/Staff: Get order by session
router.get("/session/:sessionId", OrderController.getOrderBySession);


// ==================== STAFF/ADMIN ONLY ====================
router.use(authMiddleware);

// Get All Orders (Filtered) - Manager/Waiter/Kitchen
router.get(
    "/",
    roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.WAITER, Role.KITCHEN]),
    OrderController.getOrders
);

// Update Status - Manager/Waiter/Kitchen
router.patch(
    "/:id/status",
    roleGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.WAITER, Role.KITCHEN]),
    OrderController.updateOrderStatus
);

// Update Order Items Status - Waiter
router.patch(
    "/:id/items",
    roleGuard([Role.WAITER, Role.ADMIN, Role.SUPER_ADMIN]),
    OrderController.updateOrderItems
);

// Complete Order and Close Session - Waiter (Simple payment confirmation)
router.post(
    "/:id/complete",
    roleGuard([Role.WAITER, Role.ADMIN, Role.SUPER_ADMIN]),
    OrderController.completeOrder
);

export default router;
