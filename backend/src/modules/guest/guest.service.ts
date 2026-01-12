import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ==================== SESSION ====================

/**
 * Start or get existing table session
 */
export const startSession = async (tableId: string) => {
    // Check if table exists
    const table = await prisma.table.findUnique({
        where: { id: tableId },
    });

    if (!table) {
        throw new Error("Table not found");
    }

    // Find existing open session for this table
    let session = await prisma.tableSession.findFirst({
        where: {
            tableId: tableId,
            status: "OPEN",
        },
    });

    // If no session exists, create a new one
    if (!session) {
        session = await prisma.tableSession.create({
            data: {
                tableId: tableId,
                status: "OPEN",
            },
        });
    }

    return session;
};

// ==================== CATEGORIES ====================

/**
 * Get all categories for guest menu
 */
export const getCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { name: "asc" },
    });
};

// ==================== MENU ITEMS ====================

interface GetMenuItemsOptions {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isChefRecommended?: boolean;
    sortBy?: string;
}

/**
 * Get menu items with filtering, sorting, and pagination
 */
export const getMenuItems = async (options: GetMenuItemsOptions) => {
    const { page = 1, limit = 10, search, categoryId, isChefRecommended, sortBy } = options;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.MenuItemWhereInput = {
        status: { in: ["AVAILABLE", "SOLD_OUT"] }, // Include sold out items for display
    };

    if (search) {
        where.name = { contains: search, mode: "insensitive" };
    }

    if (categoryId && categoryId !== "all") {
        where.categoryId = categoryId;
    }

    if (isChefRecommended) {
        where.isChefRecommended = true;
    }

    // Determine sort order
    let orderBy: Prisma.MenuItemOrderByWithRelationInput[] = [
        { isChefRecommended: "desc" },
        { createdAt: "desc" },
    ];

    if (sortBy === "popular") {
        // Note: Prisma doesn't support orderBy on _count directly in findMany
        // This is a simplified version
        orderBy = [{ createdAt: "desc" }];
    }

    const items = await prisma.menuItem.findMany({
        where,
        take: limit,
        skip,
        include: {
            photos: true,
            modifierGroups: {
                include: { options: true },
            },
            _count: {
                select: { orderItems: true },
            },
        },
        orderBy,
    });

    return {
        data: items,
        hasMore: items.length === limit,
    };
};

// ==================== ORDER ====================

/**
 * Get order details by table session ID
 */
export const getOrderDetails = async (tableSessionId: string) => {
    return await prisma.order.findUnique({
        where: { tableSessionId },
        include: {
            items: {
                include: {
                    menuItem: true,
                    modifiers: { include: { modifierOption: true } },
                },
            },
            tableSession: {
                include: { table: true },
            },
        },
    });
};

/**
 * Request bill for an order
 */
export const requestBill = async (orderId: string) => {
    return await prisma.order.update({
        where: { id: orderId },
        data: { billRequested: true },
    });
};

// ==================== REVIEWS ====================

interface GetReviewsOptions {
    menuItemId: string;
    page?: number;
    limit?: number;
}

/**
 * Get reviews for a menu item with pagination
 */
export const getMenuItemReviews = async (options: GetReviewsOptions) => {
    const { menuItemId, page = 1, limit = 5 } = options;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
        where: { menuItemId },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { fullName: true, avatarUrl: true },
            },
        },
    });

    const total = await prisma.review.count({ where: { menuItemId } });

    return {
        data: reviews,
        total,
        hasMore: skip + reviews.length < total,
    };
};

interface CreateReviewInput {
    menuItemId: string;
    userId?: string;
    rating: number;
    comment?: string;
    customerName?: string;
}

/**
 * Create a new review for a menu item
 */
export const createMenuItemReview = async (input: CreateReviewInput) => {
    const { menuItemId, userId, rating, comment, customerName } = input;

    if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    return await prisma.review.create({
        data: {
            menuItemId,
            userId: userId || null,
            rating,
            comment,
            customerName: customerName || "Khách vãng lai",
        },
    });
};
