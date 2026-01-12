import e, { Request, Response } from "express";
import * as menuService from "./menu.service";
import { MenuItemOptions, SortOption } from "../../types/menu.types";
import { MenuItemStatus } from "@prisma/client";
// Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await menuService.createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Error creating category", error });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await menuService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

//Get category by id
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await menuService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(5000).json({ message: "Error fetching category", error });
  }
};

// Delete category by id
export const deleteCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await menuService.deleteCategoryById(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

//crate menu item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const menuItem = await menuService.createMenuItem(data);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: "Error creating menu item", error });
  }
};

// update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedMenuItem = await menuService.updateMenuItem(id, data);
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: "Error updating menu item", error });
  }
};

//delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await menuService.deleteMenuItem(id);
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu item", error });
  }
};
//get menu items by category id
export const getMenuItemsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const menuItems = await menuService.getMenuItemsByCategoryId(categoryId);
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items", error });
  }
};
//get menu item by id
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await menuService.getMenuItemById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu item", error });
  }
};

//get menu items
export const getMenuItems = async(req: Request, res: Response) =>{
  try{
    const {
      page,
      limit,
      search,
      minPrice, 
      maxPrice, 
      status, 
      categoryId, 
      isChefRecommended, 
      sortBy
    } = req.query;

    const options: MenuItemOptions = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: String(search) || "",
      minPrice: Number(minPrice) || undefined,
      maxPrice: Number(maxPrice) || undefined,
      status: status ? status as MenuItemStatus : undefined,
      categoryId: String(categoryId) || undefined,
      isChefRecommended: Boolean(isChefRecommended) || undefined,
      sortBy: sortBy ? sortBy as SortOption : undefined,
    };
    
    const menuItems = await menuService.getMenuItems(options);
    res.status(200).json({
      message: "Menu items fetched successfully",
      menuItems,
    });
  }catch(error){
    res.status(500).json({ message: "Error fetching menu items", error });
  }
}

//create modifier group
export const createModifierGroup = async (req: Request, res: Response) => {
  try {
    // Body nhận: menuItemId, name, required (true/false)
    const { menuItemId, name, required } = req.body;

    if (!menuItemId || !name) {
      res.status(400).json({ message: "MenuItemID and Name are required" });
      return;
    }

    const group = await menuService.createModifierGroup(
      menuItemId,
      name,
      required
    );
    res.status(201).json(group);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createModifierOption = async (req: Request, res: Response) => {
  try {
    // Body nhận: modifierGroupId, name, priceDelta
    const { modifierGroupId, name, priceDelta } = req.body;

    if (!modifierGroupId || !name) {
      res.status(400).json({ message: "GroupID and Name are required" });
      return;
    }

    const option = await menuService.createModifierOption(
      modifierGroupId,
      name,
      parseFloat(priceDelta) // Ép kiểu số cho giá tiền cộng thêm
    );
    res.status(201).json(option);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
