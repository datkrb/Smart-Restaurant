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

// Get user by ID
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
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
      avatarUrl: true,
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

// Change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
};

// Get order history for customer
export const getOrderHistory = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  // Query orders that belong to the user directly OR through table sessions
  const whereCondition = {
    OR: [
      { userId: userId },
      {
        tableSession: {
          OR: [
            { waiterId: userId },
          ]
        }
      }
    ]
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      include: {
        tableSession: {
          include: {
            table: true,
          },
        },
        items: {
          include: {
            menuItem: {
              include: {
                photos: true,
              },
            },
            modifiers: {
              include: { modifierOption: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: whereCondition }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
