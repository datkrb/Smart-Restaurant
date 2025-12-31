import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import menuRoutes from "./menu/menu.routes";
import tableRoutes from "./table/table.routes";

const router = Router();

// Gắn route Auth vào đường dẫn /auth
// API sẽ là: /api/v1/auth/login, /api/v1/auth/register...
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/menu", menuRoutes);
router.use("/users", userRoutes);
router.use("/tables", tableRoutes);
export default router;
