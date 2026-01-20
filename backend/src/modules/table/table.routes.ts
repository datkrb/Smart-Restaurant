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

// 3. Regenerate QR for single table (Admin Only)
router.post(
  "/:id/regenerate-qr",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.regenerateTableQR
);

// 4. Regenerate ALL QR Codes (Admin Only)
router.post(
  "/regenerate-all-qr",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.regenerateAllQRs
);

// 4.1. Get ALL QR Images as Base64 (Admin Only)
router.get(
  "/qrs/all",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.getAllQRImages
);

// 5. Verify QR Token (Public - for guest validation)
router.post("/verify-qr", tableController.verifyQRToken);

// 6. Create Table (Admin Only)
router.post(
  "/",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.createTable
);

// 7. Update Table (Status, Name, etc.) - Admin Only
// Note: Changed from updateTableStatus to generic updateTable
router.patch(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.updateTable
);

// 8. Delete Table (Admin Only)
router.delete(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.deleteTable
);

export default router;
