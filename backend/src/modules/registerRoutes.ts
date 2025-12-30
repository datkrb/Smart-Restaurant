import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";

const router = Router();

// Gắn route Auth vào đường dẫn /auth
// API sẽ là: /api/v1/auth/login, /api/v1/auth/register...
router.use("/auth", authRoutes);
router.use("/users", userRoutes); 
export default router;
