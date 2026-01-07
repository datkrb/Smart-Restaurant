import axiosClient from './axiosClient';

export const waiterApi = {
    getAssignedTables: () => axiosClient.get('/waiter/assigned-tables'),
    getReadyOrders: () => axiosClient.get('/waiter/ready-orders'),
    serveOrder: (orderId: string) => axiosClient.patch(`/waiter/orders/${orderId}/serve`),

    // Reuse admin update status for accepting/rejecting orders if needed
    updateOrderStatus: (orderId: string, status: string) =>
        axiosClient.patch(`/admin/orders/${orderId}/status`, { status })
};
