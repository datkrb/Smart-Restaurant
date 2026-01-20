import { Request, Response } from "express";
import * as orderService from "./order.service";
import { OrderStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

/**
 * Get all orders (Admin/Staff)
 */
export const getOrders = async (req: Request, res: Response) => {
    try {
        const { page, limit, status, sortBy, sortOrder } = req.query as any;

        const result = await orderService.getOrders({
            page,
            limit,
            status: status as OrderStatus,
            sortBy,
            sortOrder,
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng" });
    }
};


/**
 * Update order items status (Waiter checks items)
 */
export const updateOrderItems = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { items } = req.body; // Expects [{itemId, status}]

        const updatedOrder = await orderService.updateOrderItems(id, items);

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order items" });
    }
};

/**
 * Update order status (Approve/Reject/Ready/Completed)
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await orderService.updateOrderStatus(id, status as OrderStatus);

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Không thể cập nhật trạng thái đơn hàng" });
    }
};


/**
 * Create a new order (Guest creates from cart)
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { tableSessionId, items } = req.body;
        let userId: string | undefined;

        // Try to get user from token if available
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
                userId = decoded.userId; // JWT uses 'userId' not 'id'
            } catch (err) {
                // Ignore invalid token, proceed as guest
            }
        }

        const order = await orderService.createOrder({ tableSessionId, items, userId });

        // Emit event for Kitchen and Waiter (realtime)
        const { io } = require("../../app");
        if (io) {
            io.emit("new_order", order);
        }

        res.status(201).json(order);
    } catch (error: any) {
        console.error(error);
        if (error.message === "Phiên làm việc không hợp lệ hoặc đã đóng") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Không thể gửi đơn hàng" });
    }
};

/**
 * Get order by table session ID
 */
export const getOrderBySession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const order = await orderService.getOrderByTableSession(sessionId);
        if (!order) {
            return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy thông tin đơn hàng" });
    }
};

/**
 * Complete order and close session (Waiter confirms payment received)
 */
export const completeOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await orderService.completeOrderAndCloseSession(id);


        res.json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to complete order" });
    }
};
