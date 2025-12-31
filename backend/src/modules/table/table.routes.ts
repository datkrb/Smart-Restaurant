import { Router } from "express";
import * as tableController from "./table.controller";
import { authMiddleware, roleGuard } from "../auth/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

// 1. Lấy danh sách bàn (Admin, Waiter đều cần xem)
router.get("/", tableController.getTables);

// 2. Lấy QR Code của bàn (Admin in ra, Waiter xem)
router.get("/:id/qr", tableController.getTableQR);

// 3. Tạo/Sửa/Xóa bàn (Chỉ Admin)
router.post(
  "/",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.createTable
);
router.patch(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.updateTableStatus
); // Disable QR
router.delete(
  "/:id",
  roleGuard([Role.ADMIN, Role.SUPER_ADMIN]),
  tableController.deleteTable
);

export default router;
