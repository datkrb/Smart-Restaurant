import { Request, Response } from "express";
import * as guestService from "./guest.service";

/**
 * Start or get existing table session
 */
export const startSession = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.body;
        console.log("Đang nhận tableId:", tableId);

        const session = await guestService.startSession(tableId);

        res.json(session);
    } catch (error: any) {
        console.error("LỖI BACKEND CHI TIẾT:", error);
        if (error.message === "Table not found") {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Could not start session" });
    }
};

/**
 * Get all categories for menu filtering
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await guestService.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh mục" });
    }
};

/**
 * Get menu items with search, filter, sort, and pagination
 */
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, categoryId, isChefRecommended, sortBy } = req.query;

        const result = await guestService.getMenuItems({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            categoryId: categoryId ? String(categoryId) : undefined,
            isChefRecommended: isChefRecommended === "true",
            sortBy: sortBy ? String(sortBy) : undefined,
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi lấy thực đơn" });
    }
};

/**
 * Get order details by table session ID
 */
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { tableSessionId } = req.params;

        const order = await guestService.getOrderDetails(tableSessionId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not get order details" });
    }
};

/**
 * Request bill for an order
 */
export const requestBill = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const order = await guestService.requestBill(orderId);

        // Emit socket event to notify waiter
        try {
            const { io } = require("../../app");
            if (io) {
                io.emit("bill_requested", order);
            }
        } catch (e) {
            console.error("Socket emit error:", e);
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not request bill" });
    }
};

/**
 * Get reviews for a menu item
 */
export const getMenuItemReviews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;

        const result = await guestService.getMenuItemReviews({
            menuItemId: id,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi lấy đánh giá" });
    }
};

/**
 * Create a new review for a menu item
 */
export const createMenuItemReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, comment, customerName } = req.body;
        const user = req.user as any;

        const review = await guestService.createMenuItemReview({
            menuItemId: id,
            userId: user?.id,
            rating: Number(rating),
            comment,
            customerName: user ? user.fullName : customerName,
        });

        res.status(201).json(review);
    } catch (error: any) {
        console.error(error);
        if (error.message === "Rating must be between 1 and 5") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Lỗi gửi đánh giá" });
    }
};
