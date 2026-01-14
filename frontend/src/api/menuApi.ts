import axiosClient from "./axiosClient";
import { MenuItem, ModifierGroup, ModifierOption } from "../types";
import { 
    GetMenuItemsParams, 
    MenuItemsResponse, 
    CreateMenuItemRequest,
    CreateModifierGroupRequest,
    CreateModifierOptionRequest
} from "../types/menu.types";

export const menuApi = {
    // 1. Get Menu Items (Filter/Search)
    getMenuItems: (params?: GetMenuItemsParams) => {
        // Cast to Promise<MenuItemsResponse> because axiosClient interceptor returns data directly
        return axiosClient.get<MenuItemsResponse>("/menu", { params }) as unknown as Promise<MenuItemsResponse>;
    },

    // 2. Get Menu Items by Category
    getMenuItemsByCategory: (categoryId: string) => {
        // Correct route matches backend: /menu/menu-items/category/:categoryId
        return axiosClient.get<MenuItem[]>(`/menu/menu-items/category/${categoryId}`) as unknown as Promise<MenuItem[]>;
    },

    // 3. Get Menu Item by ID
    getMenuItemById: (id: string) => {
        return axiosClient.get<MenuItem>(`/menu/menu-items/${id}`) as unknown as Promise<MenuItem>;
    },

    // 4. Create Menu Item
    createMenuItem: (data: CreateMenuItemRequest) => {
        return axiosClient.post<MenuItem>("/menu/menu-items", data) as unknown as Promise<MenuItem>;
    },

    // 5. Update Menu Item
    updateMenuItem: (id: string, data: Partial<CreateMenuItemRequest>) => {
        return axiosClient.patch<MenuItem>(`/menu/menu-items/${id}`, data) as unknown as Promise<MenuItem>;
    },

    // 6. Delete Menu Item
    deleteMenuItem: (id: string) => {
        return axiosClient.delete<{ message: string }>(`/menu/menu-items/${id}`) as unknown as Promise<{ message: string }>;
    },

    // 7. Modifiers
    // 7. Modifiers
    createModifierGroup: (data: CreateModifierGroupRequest) => {
        return axiosClient.post<ModifierGroup>("/menu/modifiers/groups", data) as unknown as Promise<ModifierGroup>;
    },

    updateModifierGroup: (id: string, data: { name?: string; required?: boolean }) => {
        return axiosClient.patch<ModifierGroup>(`/menu/modifiers/groups/${id}`, data) as unknown as Promise<ModifierGroup>;
    },

    deleteModifierGroup: (id: string) => {
        return axiosClient.delete<{ message: string }>(`/menu/modifiers/groups/${id}`) as unknown as Promise<{ message: string }>;
    },

    createModifierOption: (data: CreateModifierOptionRequest) => {
        return axiosClient.post<ModifierOption>("/menu/modifiers/options", data) as unknown as Promise<ModifierOption>;
    },

    updateModifierOption: (id: string, data: { name?: string; priceDelta?: number }) => {
        return axiosClient.patch<ModifierOption>(`/menu/modifiers/options/${id}`, data) as unknown as Promise<ModifierOption>;
    },
    
    deleteModifierOption: (id: string) => {
        return axiosClient.delete<{ message: string }>(`/menu/modifiers/options/${id}`) as unknown as Promise<{ message: string }>;
    }
};
