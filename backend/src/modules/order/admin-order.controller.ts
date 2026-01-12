import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import * as orderService from "./order.service";

/**
 * Get all orders (with optional status filter)
 */
export const getOrders = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        const orders = await orderService.getOrders(status as OrderStatus | undefined);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng" });
    }
};

/**
 * Update order status (Approve/Reject/Ready)
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
