import { Request, Response } from "express";
import * as userService from "./user.service";
import { Role } from "@prisma/client";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;
    // const currentUser = req.user?.role;
    const currentUser = (req.user as any)?.role;
    if (currentUser === Role.ADMIN) {
      if (role == Role.ADMIN || role == Role.SUPER_ADMIN) {
        return res.status(403).json({
          message: "You can only create Waiter, Kitchen and Customer",
        });
        return;
      }
    }

    const newUser = await userService.createUser({
      email,
      password,
      fullName,
      role,
    });
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      role,
      isEmployee,
    } = req.query as any;

    const currentUserRole = (req.user as any)?.role;
    const excludeRoles: Role[] = [];

    // Access Control Logic
    if (currentUserRole === Role.ADMIN) {
      // Admins cannot see other Admins or Super Admins
      excludeRoles.push(Role.ADMIN, Role.SUPER_ADMIN);
    }
    // Super Admins can see everyone (no exclusions needed)

    const result = await userService.getUsers({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      role,
      isEmployee: isEmployee === 'true',
      excludeRoles,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

//Activate or Deactivate User
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updateUser = await userService.updateUserById(id, { isActive });
    res
      .status(200)
      .json({ message: "User status updated successfully", data: updateUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate role update permissions if necessary
    // For now, allow admin to update any field provided in body

    const updatedUser = await userService.updateUserById(id, updateData);
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get current user profile (for logged-in customers)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userService.getUserById(userId);
    res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update current user profile (for logged-in customers)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { fullName } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate input
    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({ message: "Full name must be at least 2 characters" });
    }

    if (fullName.trim().length > 100) {
      return res.status(400).json({ message: "Full name must not exceed 100 characters" });
    }

    // Only allow updating fullName for now
    const updatedUser = await userService.updateUserById(userId, {
      fullName: fullName.trim(),
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Change password (for logged-in customers)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword.length > 50) {
      return res.status(400).json({ message: "New password must not exceed 50 characters" });
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Upload avatar (for logged-in customers)
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await userService.updateUserById(userId, { avatarUrl });

    res.status(200).json({
      message: "Avatar uploaded successfully",
      data: updatedUser
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get order history (for logged-in customers)
export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await userService.getOrderHistory(userId, Number(page), Number(limit));

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
