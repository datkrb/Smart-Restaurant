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
