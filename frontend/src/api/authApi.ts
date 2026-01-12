import axiosClient from "./axiosClient";
import {LoginResponse} from "../types/auth.types";

export const authApi = {
    login: async (email: string, password: string) => {
        return axiosClient.post<LoginResponse>("/auth/login", {
            email,
            password,
        }) as unknown as Promise<LoginResponse>;
    },
    register: async (email: string, password: string, fullName: string) => {
        return axiosClient.post<any, any>("/auth/register", {
            email,
            password,
            fullName,
        })
    },
    forgotPassword: async (email: string) => {
        return axiosClient.post<any, any>("/auth/forgot-password", {
            email,
        })
    },
    verifyEmail: async (token: string) => {
        return axiosClient.post<any, any>("/auth/verify-email", {
            token,
        })
    },
    resetPassword: async (token: string, newPassword: string) => {
        return axiosClient.post<any, any>("/auth/reset-password", {
            token,
            newPassword
        })
    },
    
};

