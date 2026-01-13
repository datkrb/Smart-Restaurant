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

export default router;
