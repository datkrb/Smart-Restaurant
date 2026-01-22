import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils/token";

const router = Router();

import passport from "passport";

router.post("/register", authController.register);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);


// 1. Route gọi cửa sổ login Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Route Google trả về sau khi login xong
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // User đã vào được đây tức là login thành công
    const user = req.user as any;
    
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Redirect về Frontend kèm Token trên URL (Frontend sẽ cắt lấy token này lưu vào storage)
    // Lưu ý: Đây là cách đơn giản, thực tế có thể dùng cookie an toàn hơn
    res.redirect(`https://smart-restaurant-fe.onrender.com/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}`);
  }
);
export default router;
