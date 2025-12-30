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
    const users = await userService.getUsers();
    res.status(200).json({ data: users });
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
