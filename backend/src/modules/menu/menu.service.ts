import { PrismaClient, MenuItemStatus } from "@prisma/client";

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
  return await prisma.menuItem.findMany({
    where: {
      categoryId,
    },
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
