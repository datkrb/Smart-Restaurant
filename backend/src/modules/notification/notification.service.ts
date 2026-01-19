import { Server as SocketIOServer } from "socket.io";

// Socket.IO instance will be set from app.ts
let io: SocketIOServer | null = null;

// Store connected sockets by role/room
const rooms = {
  WAITER: 'waiter_room',
  KITCHEN: 'kitchen_room',
  ADMIN: 'admin_room',
};

/**
 * Initialize the notification service with Socket.IO instance
 */
export const initializeNotificationService = (socketIO: SocketIOServer) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join room based on role
    socket.on('join_room', (data: { role: string; tableSessionId?: string }) => {
      const { role, tableSessionId } = data;
      
      // Join role-based room
      if (role === 'WAITER') {
        socket.join(rooms.WAITER);
        console.log(`👤 Socket ${socket.id} joined waiter room`);
      } else if (role === 'KITCHEN') {
        socket.join(rooms.KITCHEN);
        console.log(`👨‍🍳 Socket ${socket.id} joined kitchen room`);
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        socket.join(rooms.ADMIN);
        console.log(`👑 Socket ${socket.id} joined admin room`);
      }
      
      // Join table session room for customer tracking
      if (tableSessionId) {
        socket.join(`session_${tableSessionId}`);
        console.log(`🍽️ Socket ${socket.id} joined session room: ${tableSessionId}`);
      }
    });

    // Leave room
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  console.log('✅ Notification service initialized');
};

/**
 * Notify waiters about a new order
 */
export const notifyNewOrder = (data: {
  orderId: string;
  tableId: string;
  tableName: string;
  tableSessionId: string;
  items: any[];
  totalAmount: number;
}) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  console.log('📢 Emitting new_order to waiter room:', data.orderId);
  
  // Notify all waiters
  io.to(rooms.WAITER).emit('new_order', {
    type: 'NEW_ORDER',
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Notify admins too
  io.to(rooms.ADMIN).emit('new_order', {
    type: 'NEW_ORDER',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify kitchen when order is accepted by waiter
 */
export const notifyOrderAccepted = (data: {
  orderId: string;
  tableId: string;
  tableName: string;
  tableSessionId: string;
  items: any[];
}) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  console.log('📢 Emitting order_accepted to kitchen room:', data.orderId);
  
  io.to(rooms.KITCHEN).emit('order_accepted', {
    type: 'ORDER_ACCEPTED',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify customer when order is ready
 */
export const notifyOrderReady = (data: {
  orderId: string;
  tableSessionId: string;
  items?: any[];
}) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  console.log('📢 Emitting order_ready to session:', data.tableSessionId);
  
  // Notify customer via their session room
  io.to(`session_${data.tableSessionId}`).emit('order_ready', {
    type: 'ORDER_READY',
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Also notify waiters
  io.to(rooms.WAITER).emit('order_ready', {
    type: 'ORDER_READY',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify when order is served
 */
export const notifyOrderServed = (data: {
  orderId: string;
  tableSessionId: string;
}) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  console.log('📢 Emitting order_served to session:', data.tableSessionId);
  
  io.to(`session_${data.tableSessionId}`).emit('order_served', {
    type: 'ORDER_SERVED',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Generic order status update notification
 */
export const notifyOrderStatusChange = (data: {
  orderId: string;
  tableSessionId: string;
  status: string;
  items?: any[];
}) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  console.log('📢 Emitting order_status_change:', data.orderId, data.status);
  
  // Notify customer
  io.to(`session_${data.tableSessionId}`).emit('order_status_change', {
    type: 'ORDER_STATUS_CHANGE',
    ...data,
    timestamp: new Date().toISOString(),
  });

  // Notify all staff
  io.to(rooms.WAITER).emit('order_status_change', {
    type: 'ORDER_STATUS_CHANGE',
    ...data,
    timestamp: new Date().toISOString(),
  });

  io.to(rooms.KITCHEN).emit('order_status_change', {
    type: 'ORDER_STATUS_CHANGE',
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initializeNotificationService,
  notifyNewOrder,
  notifyOrderAccepted,
  notifyOrderReady,
  notifyOrderServed,
  notifyOrderStatusChange,
};
