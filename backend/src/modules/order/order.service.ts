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
    tableSession: { include: { table: true } },
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

        if (!order) {
            order = await tx.order.create({
                data: {
                    tableSessionId: tableSessionId,
                    status: "RECEIVED",
                    totalAmount: 0,
                },
            });
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
export const getOrders = async (status?: OrderStatus) => {
    const whereCondition = status ? { status } : {};

    return await prisma.order.findMany({
        where: whereCondition,
        include: orderInclude,
        orderBy: { createdAt: "asc" }, // FIFO - oldest first
    });
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
