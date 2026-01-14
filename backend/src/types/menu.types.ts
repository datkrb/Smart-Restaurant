// src/types/menu.types.ts
import { MenuItemStatus } from "@prisma/client";

// Enum phải là giá trị thật (Runtime value), không nên để trong declare global
export enum SortOption {
  price_ASC = "price_ASC",
  price_DESC = "price_DESC",
  newest = "newest",
  name_ASC = "name_ASC",
  name_DESC = "name_DESC",
}

export interface MenuItemOptions {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: MenuItemStatus;
  categoryId?: string;
  isChefRecommended?: boolean;
  sortBy?: SortOption;
}