import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();



// 1. Thống kê tổng quan (Dashboard Header)
export const getDashboardStats = async (startDate?: Date, endDate?: Date) => {
  // Default to today if not provided
  const start = startDate || new Date(new Date().setHours(0,0,0,0));
  const end = endDate || new Date(new Date().setHours(23,59,59,999));

  // Doanh thu trong khoảng
  const revenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: start, lte: end },
      status: OrderStatus.COMPLETED
    }
  });

  // Tổng số đơn trong khoảng
  const orderCount = await prisma.order.count({
    where: { 
      createdAt: { gte: start, lte: end } 
    }
  });

  // Tổng khách đang active (Realtime - không theo date range)
  const activeSessions = await prisma.tableSession.count({
    where: { status: 'OPEN' }
  });

  return {
    revenue: revenueAgg._sum.totalAmount || 0,
    orders: orderCount,
    activeGuests: activeSessions
  };
};

// 2. Doanh thu theo ngày/giờ (Chart)
export const getRevenueByDate = async (startDate: Date, endDate: Date) => {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: OrderStatus.COMPLETED
    },
    select: { createdAt: true, totalAmount: true }
  });

  // Check duration in hours
  const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const isHourly = diffHours <= 24;

  const revenueMap: Record<string, number> = {};

  orders.forEach(order => {
    let key;
    if (isHourly) {
        // HH:00
        const h = order.createdAt.getHours().toString().padStart(2, '0');
        key = `${h}:00`;
    } else {
        // YYYY-MM-DD
        key = order.createdAt.toISOString().split('T')[0];
    }
    revenueMap[key] = (revenueMap[key] || 0) + order.totalAmount;
  });

  return Object.keys(revenueMap).map(key => ({
    date: key, // Use 'date' key for compatibility but it might be hour
    revenue: revenueMap[key]
  })).sort((a,b) => a.date.localeCompare(b.date));
};

// 3. Món bán chạy nhất (Top Selling)
export const getTopSellingItems = async () => {
    // Ideally adding date range support here too, but for simplicity keeping it all-time or could update later
  const topItems = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    _sum: { quantity: true },
    orderBy: {
      _sum: { quantity: 'desc' }
    },
    take: 5
  });

  const result = await Promise.all(topItems.map(async (item) => {
    const menuInfo = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId }
    });
    return {
      name: menuInfo?.name || 'Unknown',
      quantity: item._sum.quantity
    };
  }));

  return result;
};

// 4. Thống kê User
export const getUserStats = async (startDate: Date, endDate: Date) => {
    // New Users
    const newUsers = await prisma.user.count({
        where: {
            createdAt: { gte: startDate, lte: endDate },
            role: 'CUSTOMER'
        }
    });

    // Top Spenders
    // Group orders by userId
    const topSpenders = await prisma.order.groupBy({
        by: ['userId'],
        _sum: { totalAmount: true },
        where: {
            createdAt: { gte: startDate, lte: endDate },
            status: OrderStatus.COMPLETED,
            userId: { not: null }
        },
        orderBy: {
            _sum: { totalAmount: 'desc' }
        },
        take: 5
    });

    const spendingRanking = await Promise.all(topSpenders.map(async (item) => {
        if(!item.userId) return null;
        const user = await prisma.user.findUnique({
            where: { id: item.userId },
            select: { fullName: true, email: true }
        });
        return {
            name: user?.fullName || 'Unknown',
            email: user?.email || '',
            totalSpent: item._sum.totalAmount || 0
        };
    }));

    return {
        newUsers,
        topSpenders: spendingRanking.filter(u => u !== null)
    };
}
