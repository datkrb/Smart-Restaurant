import { Request, Response } from "express";
import * as waiterService from "./waiter.service";

/**
 * Get tables assigned to the logged-in waiter
 */
export const getAssignedTables = async (req: Request, res: Response) => {
    try {
        const waiterId = (req.user as any)?.userId;

        const tables = await waiterService.getAssignedTables(waiterId);

        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách bàn được giao" });
    }
};

/**
 * Get orders that are ready to be served (READY status)
 */
export const getReadyOrders = async (req: Request, res: Response) => {
    try {
        const waiterId = (req.user as any)?.userId;

        const orders = await waiterService.getReadyOrders(waiterId);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng sẵn sàng phục vụ" });
    }
};

/**
 * Mark an order as served
 */
export const markOrderAsServed = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const updatedOrder = await waiterService.markOrderAsServed(orderId);

        // Realtime notify
        const { io } = require("../../app");
        if (io) {
            io.emit("order_status_updated", updatedOrder);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Lỗi cập nhật trạng thái đơn hàng" });
    }
};
