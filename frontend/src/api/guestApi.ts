import axiosClient from './axiosClient';

export const guestApi = {
  startSession: (tableId: string) => {
    return axiosClient.post('/guest/session', { tableId });
  },
  getMenu: () => {
    return axiosClient.get('/guest/menu');
  },
  placeOrder: (data: any) => { 
    return axiosClient.post('/guest/orders', data);
  }
};