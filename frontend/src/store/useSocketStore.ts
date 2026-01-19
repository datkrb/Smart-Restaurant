import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// Notification types
export interface OrderNotification {
  type: 'NEW_ORDER' | 'ORDER_ACCEPTED' | 'ORDER_READY' | 'ORDER_SERVED' | 'ORDER_STATUS_CHANGE';
  orderId: string;
  tableId?: string;
  tableName?: string;
  tableSessionId?: string;
  status?: string;
  items?: any[];
  totalAmount?: number;
  timestamp: string;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  notifications: OrderNotification[];
  connect: () => void;
  disconnect: () => void;
  joinRoom: (data: { role: string; tableSessionId?: string }) => void;
  leaveRoom: (room: string) => void;
  clearNotifications: () => void;
  // Event listener registration
  onNewOrder: (callback: (data: OrderNotification) => void) => () => void;
  onOrderAccepted: (callback: (data: OrderNotification) => void) => () => void;
  onOrderReady: (callback: (data: OrderNotification) => void) => () => void;
  onOrderServed: (callback: (data: OrderNotification) => void) => () => void;
  onOrderStatusChange: (callback: (data: OrderNotification) => void) => () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: () => {
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('❌ Socket disconnected');
    });

    // Default notification handlers - show toast
    socket.on('new_order', (data: OrderNotification) => {
      console.log('📢 New order received:', data);
      set(state => ({
        notifications: [data, ...state.notifications.slice(0, 49)] // Keep last 50
      }));
    });

    socket.on('order_accepted', (data: OrderNotification) => {
      console.log('📢 Order accepted:', data);
      set(state => ({
        notifications: [data, ...state.notifications.slice(0, 49)]
      }));
    });

    socket.on('order_ready', (data: OrderNotification) => {
      console.log('📢 Order ready:', data);
      toast.success('🍽️ Your order is ready!', { duration: 5000 });
      set(state => ({
        notifications: [data, ...state.notifications.slice(0, 49)]
      }));
    });

    socket.on('order_served', (data: OrderNotification) => {
      console.log('📢 Order served:', data);
      set(state => ({
        notifications: [data, ...state.notifications.slice(0, 49)]
      }));
    });

    socket.on('order_status_change', (data: OrderNotification) => {
      console.log('📢 Order status changed:', data);
      set(state => ({
        notifications: [data, ...state.notifications.slice(0, 49)]
      }));
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false, notifications: [] });
  },

  joinRoom: (data) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit('join_room', data);
      console.log(`🚪 Joined room with:`, data);
    }
  },

  leaveRoom: (room) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit('leave_room', room);
      console.log(`🚪 Left room: ${room}`);
    }
  },

  clearNotifications: () => set({ notifications: [] }),

  // Custom event listener registration methods
  // Returns cleanup function
  onNewOrder: (callback) => {
    const socket = get().socket;
    if (socket) {
      socket.on('new_order', callback);
      return () => socket.off('new_order', callback);
    }
    return () => {};
  },

  onOrderAccepted: (callback) => {
    const socket = get().socket;
    if (socket) {
      socket.on('order_accepted', callback);
      return () => socket.off('order_accepted', callback);
    }
    return () => {};
  },

  onOrderReady: (callback) => {
    const socket = get().socket;
    if (socket) {
      socket.on('order_ready', callback);
      return () => socket.off('order_ready', callback);
    }
    return () => {};
  },

  onOrderServed: (callback) => {
    const socket = get().socket;
    if (socket) {
      socket.on('order_served', callback);
      return () => socket.off('order_served', callback);
    }
    return () => {};
  },

  onOrderStatusChange: (callback) => {
    const socket = get().socket;
    if (socket) {
      socket.on('order_status_change', callback);
      return () => socket.off('order_status_change', callback);
    }
    return () => {};
  },
}));

