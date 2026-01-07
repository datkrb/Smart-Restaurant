import { Router } from "express";
import { authMiddleware, roleGuard } from "../modules/auth/auth.middleware";
import * as WaiterController from "../controllers/waiter.controller";
import { Role } from "@prisma/client";

const router = Router();

// Tất cả các route này yêu cầu đăng nhập và có quyền WAITER
router.use(authMiddleware);
router.use(roleGuard([Role.WAITER]));

router.get("/assigned-tables", WaiterController.getAssignedTables);
router.get("/ready-orders", WaiterController.getReadyOrders);
router.patch("/orders/:orderId/serve", WaiterController.markOrderAsServed);

export default router;
