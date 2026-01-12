import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/token";
import crypto from "crypto";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (
  email: string,
  password: string,
  fullName: string
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { 
      email, 
      password: hashedPassword, 
      fullName, 
      role: Role.CUSTOMER,
      isVerified: false // Default to false
    },
    select: { id: true, email: true, fullName: true, role: true },
  });

  // Gửi email kích hoạt ngay sau khi đăng ký
  await sendVerificationEmail(newUser.id, newUser.email);

  return newUser;
};

export const generateTokensForUser = async (user: User) => {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  const userResponse = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isVerified: user.isVerified,
    avatarUrl: user.avatarUrl,
  };
  return {
    userResponse,
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token) as any;
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!user || user.refreshToken !== token)
    throw new Error("Invalid refresh token");

  return { accessToken: generateAccessToken(user.id, user.role) };
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  return true;
};

import { emailService } from "../../shared/services/email.service";

// ... imports remain the same

// ... register function needs modification separately, let's update helper functions first

export const sendVerificationEmail = async (userId: string, email: string) => {
  const token = crypto.randomBytes(32).toString("hex");

  // Lưu token vào DB
  await prisma.user.update({
    where: { id: userId },
    data: { verificationToken: token },
  });

  // Gửi email thật
  await emailService.sendVerificationEmail(email, token);

  return token;
};

// ... verifyEmail function remains same

// 3. Yêu cầu Reset Password (Quên mật khẩu)
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: { forgotPasswordToken: token },
  });

  // Gửi email reset thật
  await emailService.sendPasswordResetEmail(email, token);

  return token;
};

// 2. Xác nhận email từ user
export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) throw new Error("Invalid or expired verification token");

  // Update trạng thái active
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null, // Xóa token sau khi dùng
    },
  });

  return true;
};


// 4. Đặt lại mật khẩu mới
export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: { forgotPasswordToken: token },
  });

  if (!user) throw new Error("Invalid or expired reset token");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      forgotPasswordToken: null, // Xóa token sau khi dùng
    },
  });

  return true;
};
