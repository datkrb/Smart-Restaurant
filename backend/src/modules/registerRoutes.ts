import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import tableRoutes from "./table/table.routes";
import menuRoutes from "./menu/menu.routes";
import guestRoutes from "./guest/guest.routes";
import orderRoutes from "./order/order.routes";
import reportRoutes from "./report/report.route";

const router = Router();

// Gắn route Auth vào đường dẫn /auth
// API sẽ là: /api/v1/auth/login, /api/v1/auth/register...
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tables", tableRoutes);
router.use("/menu", menuRoutes);
router.use("/guest", guestRoutes); // Public guest routes
router.use("/orders", orderRoutes); // Order routes (some public, some protected)
router.use("/reports", reportRoutes);

export default router;

