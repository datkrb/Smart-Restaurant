import { PrismaClient, Role, User } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Create a new user Staff
export const createUser = async (data: any) => {
  const { email, password, fullName, role } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role: role || Role.CUSTOMER,
    },

    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });
};

// Get user list
export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// update user by id
export const updateUserById = async (id: string, data: Partial<User>) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });
};
