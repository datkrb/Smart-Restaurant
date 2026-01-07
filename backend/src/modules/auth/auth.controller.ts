import { Request, Response } from "express";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    const user = await authService.register(email, password, fullName);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const data = await authService.generateTokensForUser(user);
    res.json(data);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);
    res.json(data);
  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Ép kiểu req.user thành bất kỳ (any) để bỏ qua kiểm tra nghiêm ngặt của TS tại đây
    const user = req.user as any;
    if (user && user.id) {
      await authService.logout(user.id);
    }
    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body; // User gửi token lên
    if (!token) {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    await authService.verifyEmail(token);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    await authService.forgotPassword(email);
    // Luôn trả về thành công để tránh lộ thông tin email có tồn tại hay không (Bảo mật)
    res
      .status(200)
      .json({ message: "If email exists, a reset link has been sent" });
  } catch (error: any) {
    // Log lỗi server nhưng vẫn trả về thông báo chung chung cho user
    console.error(error);
    res
      .status(200)
      .json({ message: "If email exists, a reset link has been sent" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required" });
      return;
    }

    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
