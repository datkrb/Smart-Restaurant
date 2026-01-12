import axiosClient from "./axiosClient";
import { Category, CategoryResponse } from "../types/category.types";

export const categoryApi = {
    //get all category
    getAllCategories: async () => {
        return axiosClient.get<Category[]>("/menu/categories") as unknown as Promise<Category[]>;
    },
    //get category by id 
    getCategoryById: async (id: string) => {
        return axiosClient.get<Category>(`/menu/categories/${id}`) as unknown as Promise<Category>;
    },
    createCategory: async (name: string) => {
        return axiosClient.post<Category>("/menu/categories", { name }) as unknown as Promise<Category>;
    },
    updateCategory: async (id: string, name: string) => {
        return axiosClient.patch<Category>(`/menu/categories/${id}`, { name }) as unknown as Promise<Category>;
    },
    deleteCategory: async (id: string) => {
        return axiosClient.delete<{ message: string }>(`/menu/categories/${id}`) as unknown as Promise<{ message: string }>;
    },
}