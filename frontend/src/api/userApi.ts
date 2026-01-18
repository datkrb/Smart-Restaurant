import axiosClient from "./axiosClient";
import { GetUsersParams, GetUsersResponse } from "../types/user.types";

export const userApi = {
  getUsers: async (params: GetUsersParams) => {
    return axiosClient.get<GetUsersResponse>("/users", {
      params,
    }) as unknown as Promise<GetUsersResponse>;
  },

  createUser: async (data: any) => {
    return axiosClient.post("/users", data);
  },

  updateUser: async (id: string, data: any) => {
    return axiosClient.patch(`/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return axiosClient.delete(`/users/${id}`);
  },

  // Profile endpoints (for logged-in customers)
  getProfile: async () => {
    return axiosClient.get("/users/profile");
  },

  updateProfile: async (data: { fullName: string }) => {
    return axiosClient.patch("/users/profile", data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return axiosClient.patch("/users/profile/password", data);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getOrderHistory: async (page: number = 1, limit: number = 10) => {
    return axiosClient.get("/users/profile/orders", { params: { page, limit } });
  },
};
