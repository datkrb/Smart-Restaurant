import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

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
 * Get tables assigned to a specific waiter
 */
export const getAssignedTables = async (waiterId?: string) => {
    return await prisma.table.findMany({
        where: waiterId ? { waiterId } : {},
        include: {
            sessions: {
                where: { status: "OPEN" },
                include: {
                    order: {
                        include: {
                            items: {
                                include: { menuItem: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    });
};

/**
 * Get orders that are ready to be served (READY status) for waiter's assigned tables
 */
export const getReadyOrders = async (waiterId?: string) => {
    const whereClause: any = {
        status: "READY" as OrderStatus,
    };

    if (waiterId) {
        whereClause.tableSession = {
            table: { waiterId: waiterId },
        };
    }

    return await prisma.order.findMany({
        where: whereClause,
        include: orderInclude,
        orderBy: { createdAt: "asc" },
    });
};

/**
 * Mark an order as served
 */
export const markOrderAsServed = async (orderId: string) => {
    return await prisma.order.update({
        where: { id: orderId },
        data: { status: "SERVED" },
        include: orderInclude,
    });
};

/**
 * Get all orders for a specific waiter's tables
 */
export const getOrdersForWaiter = async (waiterId: string, status?: OrderStatus) => {
    const whereClause: any = {
        tableSession: {
            table: { waiterId: waiterId },
        },
    };

    if (status) {
        whereClause.status = status;
    }

    return await prisma.order.findMany({
        where: whereClause,
        include: orderInclude,
        orderBy: { createdAt: "asc" },
    });
};
