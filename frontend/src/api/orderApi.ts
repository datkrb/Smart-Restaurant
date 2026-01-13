import axiosClient from "./axiosClient";
import { Order } from "../types/order.types";

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface GetOrdersResponse {
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  getOrders: async (params: GetOrdersParams) => {
    return axiosClient.get<GetOrdersResponse>("/orders", {
      params,
    }) as unknown as Promise<GetOrdersResponse>;
  },

  updateStatus: async (id: string, status: string) => {
    return axiosClient.patch<Order>(`/orders/${id}/status`, {
      status
    }) as unknown as Promise<Order>;
  },
  
  // Re-export existing or needed methods if guestApi doesn't cover
  // But guest usually uses public endpoints. Admin uses this.
};
