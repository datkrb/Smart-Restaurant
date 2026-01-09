import axiosClient from "./axiosClient";
import {LoginResponse} from "../types/auth.types";

export const authApi = {
    login: async (email: string, password: string) => {
        return axiosClient.post<any, LoginResponse>("/auth/login", {
            email,
            password,
        })
    },
    register: async (email: string, password: string, fullName: string) => {
        return axiosClient.post<any, LoginResponse>("/auth/register", {
            email,
            password,
            fullName,
        })
    },
    
};

