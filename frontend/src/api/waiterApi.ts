import axiosClient from './axiosClient';

export const waiterApi = {
    // Get orders with status READY for serving
    getReadyOrders: () => axiosClient.get('/orders?status=READY'),

    // Mark order as served
    serveOrder: (orderId: string) => axiosClient.patch(`/orders/${orderId}/status`, { status: 'SERVED' }),

    // Update order status (accept/reject)
    updateOrderStatus: (orderId: string, status: string) =>
        axiosClient.patch(`/orders/${orderId}/status`, { status }),

    // Update specific items
    updateOrderItems: (orderId: string, items: { itemId: string; status: string }[]) =>
        axiosClient.patch(`/orders/${orderId}/items`, { items })
};
