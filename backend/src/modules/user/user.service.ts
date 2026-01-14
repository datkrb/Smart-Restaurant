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
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: Role;
  isEmployee?: boolean;
  excludeRoles?: Role[];
}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    role,
    isEmployee,
    excludeRoles,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  // Filter by Role
  if (role) {
    where.role = role;
  }

  // Filter by Employee status (All roles except CUSTOMER)
  if (isEmployee) {
    where.role = {
      not: Role.CUSTOMER,
    };
  }

  // Exclude specific roles (e.g. Admin cannot see other Admins)
  if (excludeRoles && excludeRoles.length > 0) {
    where.role = {
      ...where.role,
      notIn: excludeRoles,
    };
  }

  // Search by name or email
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
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

// delete user by id
export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  });
};
