import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Types for order creation
interface OrderItemInput {
    id: string;
    quantity: number;
    price: number;
    note?: string;
    selectedModifiers?: Record<string, { id: string; priceDelta: number }[]>;
}

interface CreateOrderInput {
    tableSessionId: string;
    items: OrderItemInput[];
}

// Include configuration for order queries
const orderInclude = {
    tableSession: {
        include: {
            table: true,
            waiter: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                }
            }
        }
    },
    items: {
        include: {
            menuItem: true,
            modifiers: { include: { modifierOption: true } },
        },
    },
};

/**
 * Create a new order or add items to existing order for a table session
 */
export const createOrder = async (data: CreateOrderInput) => {
    const { tableSessionId, items } = data;

    // 1. Check if session is valid and open
    const session = await prisma.tableSession.findUnique({
        where: { id: tableSessionId },
    });

    if (!session || session.status !== "OPEN") {
        throw new Error("Phiên làm việc không hợp lệ hoặc đã đóng");
    }

    // 2. Use Transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
        // Find or create Order for this session (1 table = 1 order)
        let order = await tx.order.findUnique({
            where: { tableSessionId: tableSessionId },
        });

        const isNewOrder = !order;

        if (!order) {
            order = await tx.order.create({
                data: {
                    tableSessionId: tableSessionId,
                    status: "RECEIVED",
                    totalAmount: 0,
                },
            });

            // Auto-assign waiter to session if not already assigned
            const sessionWithWaiter = await tx.tableSession.findUnique({
                where: { id: tableSessionId },
                select: { waiterId: true }
            });

            if (!sessionWithWaiter?.waiterId) {
                // Find an available waiter (round-robin or least busy)
                const availableWaiter = await tx.user.findFirst({
                    where: {
                        role: "WAITER",
                        isActive: true,
                    },
                    orderBy: {
                        createdAt: 'asc' // Simple round-robin by creation order
                    }
                });

                if (availableWaiter) {
                    await tx.tableSession.update({
                        where: { id: tableSessionId },
                        data: { waiterId: availableWaiter.id }
                    });
                }
            }
        }

        let orderTotalDelta = 0;

        // 3. Loop through each item in the cart to save to OrderItem
        for (const item of items) {
            const orderItem = await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    note: item.note,
                },
            });

            let itemModifiersTotal = 0;

            // 4. Save Modifiers (if any)
            if (item.selectedModifiers) {
                for (const groupId in item.selectedModifiers) {
                    for (const option of item.selectedModifiers[groupId]) {
                        await tx.orderItemModifier.create({
                            data: {
                                orderItemId: orderItem.id,
                                modifierOptionId: option.id,
                            },
                        });
                        itemModifiersTotal += option.priceDelta;
                    }
                }
            }
            orderTotalDelta += (item.price + itemModifiersTotal) * item.quantity;
        }

        // 5. Update order total and get full info
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
                totalAmount: { increment: orderTotalDelta },
                status: "RECEIVED",
            },
            include: orderInclude,
        });

        return updatedOrder;
    });

    return result;
};

/**
 * Get all orders with optional status filter
 */
/**
 * Get all orders with optional filters and pagination
 */
export const getOrders = async (params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: Date; // Optional: Filter by date range
    endDate?: Date;
}) => {
    const {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
        startDate,
        endDate
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
        where.status = status;
    }

    if (startDate && endDate) {
        where.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: orderInclude,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: Number(limit),
        }),
        prisma.order.count({ where }),
    ]);

    return {
        data: orders,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (id: string) => {
    return await prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });
};

/**
 * Update order status
 */
export const updateOrderStatus = async (id: string, status: OrderStatus) => {
    return await prisma.order.update({
        where: { id },
        data: { status },
        include: orderInclude,
    });
};

/**
 * Get orders by table session ID
 */
export const getOrderByTableSession = async (tableSessionId: string) => {
    return await prisma.order.findUnique({
        where: { tableSessionId },
        include: orderInclude,
    });
};

/**
 * Update status of multiple items in an order
 */
export const updateOrderItems = async (orderId: string, itemStatuses: { itemId: string, status: OrderStatus }[]) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Update each item
        for (const { itemId, status } of itemStatuses) {
            await tx.orderItem.update({
                where: { id: itemId },
                data: { status }
            });
        }

        // 2. Get updated order with items and modifiers
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        modifiers: {
                            include: { modifierOption: true }
                        }
                    }
                }
            }
        });

        if (!order) throw new Error("Order not found");

        // 3. Recalculate totalAmount (exclude CANCELLED items)
        let newTotalAmount = 0;
        for (const item of order.items) {
            if (item.status !== "CANCELLED") {
                let itemTotal = item.price * item.quantity;
                // Add modifier prices
                for (const mod of item.modifiers) {
                    itemTotal += (mod.modifierOption.priceDelta || 0) * item.quantity;
                }
                newTotalAmount += itemTotal;
            }
        }

        // 4. Determine new Order Status
        const allItems = order.items;
        let newOrderStatus = order.status;

        const allCancelled = allItems.every(i => i.status === "CANCELLED");
        const anyPreparing = allItems.some(i => i.status === "PREPARING");
        const allReady = allItems.every(i => i.status === "READY" || i.status === "CANCELLED" || i.status === "SERVED");

        if (allCancelled) {
            newOrderStatus = "CANCELLED";
        } else if (anyPreparing) {
            newOrderStatus = "PREPARING";
        } else if (allReady && order.status !== "SERVED" && order.status !== "COMPLETED") {
            newOrderStatus = "READY";
        }

        // 5. Update Order Status and TotalAmount
        await tx.order.update({
            where: { id: orderId },
            data: {
                status: newOrderStatus,
                totalAmount: newTotalAmount
            }
        });

        const updatedOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: orderInclude
        });

        // 6. Return result
        return updatedOrder;
    });
};

/**
 * Complete order and close table session (Simple payment flow)
 */
export const completeOrderAndCloseSession = async (orderId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Get the order
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { tableSession: true }
        });

        if (!order) throw new Error("Order not found");

        // 2. Update order status to COMPLETED
        await tx.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED" }
        });

        // 3. Close the table session
        if (order.tableSessionId) {
            await tx.tableSession.update({
                where: { id: order.tableSessionId },
                data: {
                    status: "CLOSED",
                    endedAt: new Date()
                }
            });
        }

        return { success: true, message: "Order completed and session closed" };
    });
};
