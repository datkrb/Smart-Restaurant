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
};
