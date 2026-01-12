import { Request, Response } from "express";
import * as orderService from "./order.service";

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
