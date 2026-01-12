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
export const deleteCategoryById = async (id: string) => {
  return await prisma.category.delete({
    where: {
      id,
    },
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
export const deleteMenuItem = async (id: string) => {
  return await prisma.menuItem.delete({
    where: {
      id,
    },
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