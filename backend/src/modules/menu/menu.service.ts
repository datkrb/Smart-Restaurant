import { PrismaClient, MenuItemStatus, Prisma } from "@prisma/client";
import { MenuItemOptions, SortOption } from "../../types/menu.types";
const prisma = new PrismaClient();

//Get id of restaurant
const getDefaultRestaurantId = async () => {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) {
    throw new Error("No restaurant found! Please run seed data first.");
  }
  return restaurant.id;
};

// Create category
export const createCategory = async (name: string) => {
  const restaurantId = await getDefaultRestaurantId();
  return await prisma.category.create({
    data: {
      name,
      restaurantId,
    },
  });
};

// Update category
export const updateCategory = async (id: string, name: string) => {
  return await prisma.category.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
};

// Get all categories for a restaurant
export const getCategories = async () => {
  const restaurantId = await getDefaultRestaurantId();
  return await prisma.category.findMany({
    where: {
      restaurantId,
    },
    include: {
      menuItems: true,
    },
  });
};

// Get category by id
export const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({
    where: {
      id,
    },
  });
};

//delete category by id
//delete category by id
export const deleteCategoryById = async (id: string) => {
  // 1. Fetch menu items to check for dependencies
  const menuItems = await prisma.menuItem.findMany({
    where: { categoryId: id },
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
  });

  // 2. Check if any item is ordered
  const orderedItem = menuItems.find((item) => item._count.orderItems > 0);
  if (orderedItem) {
    throw new Error(
      `Cannot delete category: Item '${orderedItem.name}' has been ordered.`
    );
  }

  // 3. Manual Cascade Delete in Transaction
  return await prisma.$transaction(async (tx) => {
    // Delete all items in category
    for (const item of menuItems) {
      // Delete Modifier Options (via Modifier Groups)
      const groups = await tx.modifierGroup.findMany({
        where: { menuItemId: item.id },
      });

      for (const group of groups) {
        await tx.modifierOption.deleteMany({
          where: { modifierGroupId: group.id },
        });
      }

      await tx.modifierGroup.deleteMany({
        where: { menuItemId: item.id },
      });

      // Manually delete Photos and Reviews to be safe
      await tx.menuItemPhoto.deleteMany({
        where: { menuItemId: item.id },
      });
      await tx.review.deleteMany({
        where: { menuItemId: item.id },
      });

      await tx.menuItem.delete({
        where: { id: item.id },
      });
    }

    // Finally delete category
    return await tx.category.delete({
      where: { id },
    });
  });
};

// Create menu item
export const createMenuItem = async (data: any) => {
  const { categoryId, name, description, price, isChefRecommended, status } =
    data;

  return await prisma.menuItem.create({
    data: {
      categoryId,
      name,
      description,
      price,
      isChefRecommended,
      status: status || MenuItemStatus.AVAILABLE,
    },
  });
};

//update menu item
export const updateMenuItem = async (id: string, data: any) => {
  return await prisma.menuItem.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
};

//delete menu item
//delete menu item
export const deleteMenuItem = async (id: string) => {
  // 1. Check if item is in any order
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
  });

  if (!menuItem) {
    throw new Error("Menu item not found");
  }

  if (menuItem._count.orderItems > 0) {
    throw new Error(
      `Cannot delete menu item: '${menuItem.name}' has been ordered.`
    );
  }

  // 2. Manual Cascade Delete in Transaction
  return await prisma.$transaction(async (tx) => {
    // A. Delete Modifier Options (via Modifier Groups)
    const groups = await tx.modifierGroup.findMany({
      where: { menuItemId: id },
    });

    for (const group of groups) {
      await tx.modifierOption.deleteMany({
        where: { modifierGroupId: group.id },
      });
    }

    // B. Delete Modifier Groups
    await tx.modifierGroup.deleteMany({
      where: { menuItemId: id },
    });

    // C. Delete Photos and Reviews (Manual Cascade)
    await tx.menuItemPhoto.deleteMany({
      where: { menuItemId: id },
    });

    await tx.review.deleteMany({
      where: { menuItemId: id },
    });

    // D. Delete the Item itself
    return await tx.menuItem.delete({
      where: { id },
    });
  });
};

//get menu items by category id
export const getMenuItemsByCategoryId = async (categoryId: string) => {
  return await getMenuItems({
    categoryId,
  });
};

//get menu item by id
export const getMenuItemById = async (id: string) => {
  return await prisma.menuItem.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      modifierGroups: {
        include: {
          options: true,
        },
      },
    },
  });
};

//Modifiers and Modifier Groups can be added similarly
//Create modifier group
export const createModifierGroup = async (
  menuItemId: string,
  name: string,
  required: boolean
) => {
  return await prisma.modifierGroup.create({
    data: {
      menuItemId,
      name,
      required: required || false,
    },
  });
};

//Create modifier
export const createModifierOption = async (
  modifierGroupId: string,
  name: string,
  price: number
) => {
  return await prisma.modifierOption.create({
    data: {
      modifierGroupId,
      name,
      priceDelta: price,
    },
  });
};

// Update Modifier Group
export const updateModifierGroup = async (
  id: string,
  data: { name?: string; required?: boolean }
) => {
  return await prisma.modifierGroup.update({
    where: { id },
    data,
  });
};

// Delete Modifier Group
export const deleteModifierGroup = async (id: string) => {
  // Manual cascade delete options first
  await prisma.modifierOption.deleteMany({
    where: { modifierGroupId: id },
  });
  return await prisma.modifierGroup.delete({
    where: { id },
  });
};

// Update Modifier Option
export const updateModifierOption = async (
  id: string,
  data: { name?: string; priceDelta?: number }
) => {
  return await prisma.modifierOption.update({
    where: { id },
    data,
  });
};

// Delete Modifier Option
export const deleteModifierOption = async (id: string) => {
  return await prisma.modifierOption.delete({
    where: { id },
  });
};

export const getMenuItems = async (options: MenuItemOptions) => {
  const {
    page = 1,
    limit = 10,
    search,
    minPrice,
    maxPrice,
    status,
    categoryId,
    isChefRecommended,
    sortBy,
  } = options;

  const skip = (page - 1) * limit;

  // 2. Fix lỗi logic lọc giá (Merge min/max vào chung 1 object)
  const priceFilter: Prisma.FloatFilter | undefined =
    (minPrice || maxPrice)
      ? {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      }
      : undefined;

  const where: Prisma.MenuItemWhereInput = {
    ...(categoryId && { categoryId }),
    ...(status && { status }),
    ...(isChefRecommended !== undefined && { isChefRecommended }), // Check undefined để cho phép false
    ...(priceFilter && { price: priceFilter }), // Sử dụng bộ lọc giá đã fix
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // 3. Fix logic Sort: Mặc định sort theo ngày tạo nếu không chọn gì
  let orderBy: Prisma.MenuItemOrderByWithRelationInput = { createdAt: 'desc' };

  if (sortBy === SortOption.price_ASC) {
    orderBy = { price: "asc" };
  } else if (sortBy === SortOption.price_DESC) {
    orderBy = { price: "desc" };
  } else if (sortBy === SortOption.newest) {
    orderBy = { createdAt: "desc" };
  } else if (sortBy === SortOption.name_ASC) {
    orderBy = { name: "asc" };
  } else if (sortBy === SortOption.name_DESC) {
    orderBy = { name: "desc" };
  }

  const [total, data] = await prisma.$transaction([
    prisma.menuItem.count({ where }),
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        modifierGroups: {
          include: {
            options: true,
          },
        },
      },
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};