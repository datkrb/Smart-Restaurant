import axiosClient from "./axiosClient";
import { GetUsersParams, GetUsersResponse } from "../types/user.types";

export const userApi = {
  getUsers: async (params: GetUsersParams) => {
    return axiosClient.get<GetUsersResponse>("/users", {
      params,
    }) as unknown as Promise<GetUsersResponse>;
  },
};
