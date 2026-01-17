import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Start or get existing table session
 */
export const startOrGetSession = async (tableId: string) => {
    // Check if table exists and is active
    const table = await prisma.table.findUnique({
        where: { id: tableId },
    });

    if (!table || !table.isActive) {
        throw new Error("Table not found or inactive");
    }

    // Check if there's already an open session for this table
    const existingSession = await prisma.tableSession.findFirst({
        where: {
            tableId,
            status: "OPEN",
        },
    });

    if (existingSession) {
        return {
            session: existingSession,
            isNew: false,
        };
    }

    // Create new session
    const session = await prisma.tableSession.create({
        data: {
            tableId,
            status: "OPEN",
            startedAt: new Date(),
        },
    });

    return {
        session,
        isNew: true,
    };
};

/**
 * Get all categories (Public)
 */
export const getCategories = async () => {
    return await prisma.category.findMany({
        include: {
            _count: {
                select: { menuItems: true },
            },
        },
        orderBy: { name: "asc" },
    });
};

/**
 * Get menu items with filters (Public)
 */
export const getMenuItems = async (params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    isChefRecommended?: boolean;
    sortBy?: string;
}) => {
    const { page = 1, limit = 20, search, categoryId, isChefRecommended, sortBy = "name" } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build filter - Show all items regardless of status so customers can see availability
    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (isChefRecommended) {
        where.isChefRecommended = true;
    }

    // Build orderBy object safely
    const orderByField = sortBy === "price" || sortBy === "name" ? sortBy : "name";
    const orderBy: any = {};
    orderBy[orderByField] = "asc";

    // Get items
    const [items, total] = await Promise.all([
        prisma.menuItem.findMany({
            where,
            skip,
            take,
            include: {
                category: true,
                photos: {
                    orderBy: { isPrimary: "desc" },
                },
                modifierGroups: {
                    include: {
                        options: true,
                    },
                },
            },
            orderBy,
        }),
        prisma.menuItem.count({ where }),
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };

};

/**
 * Get order details by table session ID (Public)
 */
export const getOrderBySession = async (sessionId: string) => {
    const order = await prisma.order.findFirst({
        where: { tableSessionId: sessionId },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            photos: {
                                where: { isPrimary: true },
                            },
                        },
                    },
                    modifiers: {
                        include: {
                            modifierOption: true,
                        },
                    },
                },
            },
            tableSession: {
                include: {
                    table: true,
                },
            },
        },
    });

    if (!order) {
        return null;
    }

    return order;
};

/**
 * Request bill for an order (Public)
 */
export const requestBill = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    if (order.billRequested) {
        throw new Error("Bill already requested");
    }

    // Update order to request bill (keep current status, just mark as bill requested)
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            billRequested: true,
        },
        include: {
            items: {
                include: {
                    menuItem: true,
                    modifiers: { include: { modifierOption: true } },
                },
            },
            tableSession: {
                include: {
                    table: true,
                },
            },
        },
    });

    return updatedOrder;
};

/**
 * Get reviews for a menu item
 */
export const getReviews = async (
    menuItemId: string,
    params: { page: number; limit: number }
) => {
    const { page = 1, limit = 5 } = params;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { menuItemId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        }),
        prisma.review.count({ where: { menuItemId } }),
    ]);

    return {
        data: reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Create a review for a menu item
 * Verifies that the customer has ordered this item in their session
 */
export const createReview = async (
    menuItemId: string,
    data: {
        rating: number;
        comment?: string;
        customerName?: string;
        userId?: string | null;
        tableSessionId: string;
    }
) => {
    // Check if menu item exists
    const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
    });

    if (!menuItem) {
        throw new Error("Menu item not found");
    }

    // Verify that the customer has ordered this item in their session
    const order = await prisma.order.findFirst({
        where: {
            tableSessionId: data.tableSessionId,
        },
        include: {
            items: {
                where: {
                    menuItemId: menuItemId,
                },
            },
        },
    });

    if (!order || order.items.length === 0) {
        throw new Error("You can only review items you have ordered");
    }

    // Check if user already reviewed this item in this session
    const existingReview = await prisma.review.findFirst({
        where: {
            menuItemId,
            OR: [
                { userId: data.userId || undefined },
                { customerName: data.customerName || undefined },
            ],
        },
    });

    if (existingReview && data.userId) {
        throw new Error("You have already reviewed this item");
    }

    // Create review with userId if logged in
    const review = await prisma.review.create({
        data: {
            menuItemId,
            rating: data.rating,
            comment: data.comment || "",
            customerName: data.customerName || (data.userId ? undefined : "Guest"),
            userId: data.userId || undefined,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return review;
};
