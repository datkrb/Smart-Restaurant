import { Request, Response } from "express";
import * as orderService from "./order.service";
import { OrderStatus } from "@prisma/client";

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

        // Realtime notify
        const { io } = require("../../app");
        if (io) {
            io.emit("order_status_updated", updatedOrder);
        }

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

        // Realtime notify
        const { io } = require("../../app");
        if (io) {
            io.emit("order_status_updated", updatedOrder);
        }

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

        const order = await orderService.createOrder({ tableSessionId, items });

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
