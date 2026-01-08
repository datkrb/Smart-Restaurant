import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "./auth.middleware";

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

export default router;
