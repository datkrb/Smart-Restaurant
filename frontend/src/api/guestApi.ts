import axiosClient from './axiosClient';

export const guestApi = {
  startSession: (tableId: string) => {
    return axiosClient.post('/guest/session', { tableId });
  },
  placeOrder: (data: any) => { 
    return axiosClient.post('/guest/orders', data);
  },
  
  getCategories: () => axiosClient.get('/guest/categories'),
  
  getMenuItems: (params: { 
    page: number; 
    limit: number; 
    search?: string; 
    categoryId?: string;
    isChefRecommended?: boolean;
  }) => axiosClient.get('/guest/menu-items', { params })
};