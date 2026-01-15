import axiosClient from "./axiosClient";

export interface DashboardStats {
    revenue: number;
    orders: number;
    activeGuests: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
}

export interface TopSellingItem {
    name: string;
    quantity: number;
}

export interface UserStats {
    newUsers: number;
    topSpenders: {
        name: string;
        email: string;
        totalSpent: number;
    }[];
}

export const reportApi = {
    getDashboardStats: async (startDate?: string, endDate?: string) => {
        return axiosClient.get('/reports/dashboard', {
             params: { startDate, endDate }
        }) as unknown as Promise<DashboardStats>;
    },

    getRevenueByDate: async (startDate: string, endDate: string) => {
        return axiosClient.get('/reports/revenue', {
            params: { startDate, endDate }
        }) as unknown as Promise<RevenueData[]>;
    },

    getTopSellingItems: async () => {
        return axiosClient.get('/reports/top-selling') as unknown as Promise<TopSellingItem[]>;
    },

    getUserStats: async (startDate: string, endDate: string) => {
        return axiosClient.get('/reports/user-stats', {
            params: { startDate, endDate }
        }) as unknown as Promise<UserStats>;
    }
};
