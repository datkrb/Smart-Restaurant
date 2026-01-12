import { Router } from "express";
import * as tableController from "./table.controller";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Middleware: Require Login for all table operations
router.use(authMiddleware);

// 1. Get Tables (Waiter/Admin)
router.get("/", tableController.getTables);

// 2. Get QR (Waiter/Admin)
router.get("/:id/qr", tableController.getTableQR);

// 3. Create Table (Admin Only)
router.post(
  "/",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.createTable
);

// 4. Update Table (Status, Name, etc.) - Admin Only
// Note: Changed from updateTableStatus to generic updateTable
router.patch(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.updateTable
);

// 5. Delete Table (Admin Only)
router.delete(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.deleteTable
);

export default router;
