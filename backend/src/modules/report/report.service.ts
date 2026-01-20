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
export const getTopSellingItems = async (startDate?: Date, endDate?: Date) => {
    const start = startDate || new Date(new Date().setHours(0,0,0,0));
    const end = endDate || new Date(new Date().setHours(23,59,59,999));

    // Filter orders first to get relevant IDs... OR filter on OrderItem via Order relation
    // Prisma grouping doesn't support deep relation filtering easily in `groupBy`.
    // Easier approach: Find many OrderItems where order.createdAt is in range.
    
    const topItems = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true },
        where: {
            order: {
                createdAt: { gte: start, lte: end },
                status: OrderStatus.COMPLETED
            }
        },
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

// 5. Thống kê theo danh mục (Pie Chart)
export const getCategoryStats = async (startDate: Date, endDate: Date) => {
    // We need to sum (quantity * price) per category.
    // Prisma group by Category is hard because OrderItem -> MenuItem -> Category.
    // We can fetch all OrderItems in range, then aggregate in JS (easiest for small-medium scale)
    // Or doing a raw query. Let's do raw query for performance/cleanliness if possible, but strict typing is annoying.
    // Let's stick to fetch + map for now, assuming not millions of rows per day yet.
    
    // Better: Group by MenuItem first (we already have that potentially), then map to category.
    const itemSales = await prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true }, // We need revenue, but price might change? 
        // OrderItem stores "price" at time of purchase.
        // We can't sum(price * quantity) directly in Prisma groupBy easily without raw query.
        
        where: {
            order: {
                createdAt: { gte: startDate, lte: endDate },
                status: OrderStatus.COMPLETED
            }
        }
    });

    // To get revenue, efficiently, we need to iterate.
    // Let's use `findMany` with select to get data for manual aggregation.
    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                createdAt: { gte: startDate, lte: endDate },
                status: OrderStatus.COMPLETED
            }
        },
        select: {
            quantity: true,
            price: true,
            menuItem: {
                select: {
                    category: { select: { name: true } }
                }
            }
        }
    });

    const categoryMap: Record<string, number> = {};
    items.forEach(item => {
        const catName = item.menuItem.category.name;
        const total = item.quantity * item.price;
        categoryMap[catName] = (categoryMap[catName] || 0) + total;
    });

    return Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));
};

// 6. Thống kê phương thức thanh toán
export const getPaymentStats = async (startDate: Date, endDate: Date) => {
    const payments = await prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        where: {
            status: 'PAID', // Assuming we only count successful payments
            order: {
                createdAt: { gte: startDate, lte: endDate } // Or payment.paidAt
            }
        }
    });

    return payments.map(p => ({
        name: p.method,
        value: p._sum.amount || 0
    }));
};
