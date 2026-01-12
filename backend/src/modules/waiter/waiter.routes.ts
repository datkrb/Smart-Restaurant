import { Router } from "express";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import * as WaiterController from "./waiter.controller";
import { Role } from "@prisma/client";

const router = Router();

// ==================== WAITER ROUTES ====================
// All routes require login with WAITER role

router.use(authMiddleware);
router.use(roleGuard([Role.WAITER, Role.ADMIN, Role.SUPER_ADMIN]));

// Get tables assigned to the logged-in waiter
router.get("/assigned-tables", WaiterController.getAssignedTables);

// Get orders ready to be served
router.get("/ready-orders", WaiterController.getReadyOrders);

// Mark order as served
router.patch("/orders/:orderId/serve", WaiterController.markOrderAsServed);

export default router;
