import { Request, Response } from "express";
import * as guestService from "./guest.service";

/**
 * Start a table session (Guest scans QR code)
 * PUBLIC - No authentication required
 */
export const startSession = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.body;

        if (!tableId) {
            return res.status(400).json({ error: "Table ID is required" });
        }

        const result = await guestService.startOrGetSession(tableId);

        const statusCode = result.isNew ? 201 : 200;
        const message = result.isNew ? "Session started successfully" : "Session already exists";

        res.status(statusCode).json({
            session: result.session,
            message,
        });
    } catch (error: any) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: error.message || "Failed to start session" });
    }
};

/**
 * Get all categories (Public)
 * PUBLIC - No authentication required
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await guestService.getCategories();
        res.json({ data: categories });
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

/**
 * Get menu items with filters (Public)
 * PUBLIC - No authentication required
 */
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            categoryId,
            isChefRecommended,
            sortBy = "name",
        } = req.query;

        const result = await guestService.getMenuItems({
            page: Number(page),
            limit: Number(limit),
            search: search as string,
            categoryId: categoryId as string,
            isChefRecommended: isChefRecommended === "true",
            sortBy: sortBy as string,
        });

        res.json({
            data: result.items,
            pagination: result.pagination,
        });
    } catch (error: any) {
        console.error("Error fetching menu items:", error);
        res.status(500).json({ error: "Failed to fetch menu items" });
    }
};

/**
 * Get order details by table session ID (Public)
 * PUBLIC - No authentication required
 */
export const getOrderBySession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const order = await guestService.getOrderBySession(sessionId);
        res.json({ data: order });
    } catch (error: any) {
        console.error("Error fetching order:", error);
        const statusCode = error.message === "Order not found" ? 404 : 500;
        res.status(statusCode).json({ error: error.message || "Failed to fetch order" });
    }
};

/**
 * Request bill for an order (Public)
 * PUBLIC - No authentication required
 */
export const requestBill = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const updatedOrder = await guestService.requestBill(orderId);

        // Emit socket event for waiter
        const { io } = require("../../app");
        if (io) {
            io.emit("bill_requested", updatedOrder);
        }

        res.json({
            message: "Bill requested successfully",
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error("Error requesting bill:", error);
        const statusCode = error.message === "Order not found" ? 404 : 500;
        res.status(statusCode).json({ error: error.message || "Failed to request bill" });
    }
};

/**
 * Get reviews for a menu item (Public)
 * PUBLIC - No authentication required
 */
export const getReviews = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;
        const { page = 1, limit = 5 } = req.query;

        const result = await guestService.getReviews(menuItemId, {
            page: Number(page),
            limit: Number(limit),
        });

        res.json(result);
    } catch (error: any) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

/**
 * Create a review for a menu item (Public)
 * PUBLIC - No authentication required
 */
export const createReview = async (req: Request, res: Response) => {
    try {
        const { menuItemId } = req.params;
        const { rating, comment, customerName } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const review = await guestService.createReview(menuItemId, {
            rating,
            comment,
            customerName,
        });

        res.status(201).json({ data: review });
    } catch (error: any) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: error.message || "Failed to create review" });
    }
};
