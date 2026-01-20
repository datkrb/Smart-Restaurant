import { MenuItem, ModifierGroup, ModifierOption } from './index';

export interface GetMenuItemsParams {
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
    categoryId?: string;
    isChefRecommended?: boolean;
    sortBy?: string;
}

export interface MenuItemsResponse {
    message: string;
    menuItems: {
        data: MenuItem[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface CreateMenuItemRequest {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    status?: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
    isChefRecommended?: boolean;
    prepTime?: number;
    photos?: { url: string; isPrimary: boolean }[];
}

export interface CreateModifierGroupRequest {
    menuItemId: string;
    name: string;
    required: boolean;
}

export interface CreateModifierOptionRequest {
    modifierGroupId: string;
    name: string;
    priceDelta: number;
}
