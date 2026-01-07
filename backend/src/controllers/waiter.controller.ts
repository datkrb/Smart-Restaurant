import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách bàn được giao cho Waiter này
export const getAssignedTables = async (req: Request, res: Response) => {
    try {
        const waiterId = (req.user as any).userId;

        const tables = await prisma.table.findMany({
            where: { waiterId: waiterId },
            include: {
                sessions: {
                    where: { status: "OPEN" },
                    include: {
                        order: {
                            include: {
                                items: {
                                    include: { menuItem: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách bàn được giao" });
    }
};

// 2. Lấy danh sách đơn hàng đã nấu xong (READY) của các bàn được giao
export const getReadyOrders = async (req: Request, res: Response) => {
    try {
        const waiterId = (req.user as any).userId;

        const orders = await prisma.order.findMany({
            where: {
                status: "READY",
                tableSession: {
                    table: { waiterId: waiterId }
                }
            },
            include: {
                tableSession: {
                    include: { table: true }
                },
                items: {
                    include: {
                        menuItem: true,
                        modifiers: { include: { modifierOption: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng sẵn sàng phục vụ" });
    }
};

// 3. Đánh dấu đã phục vụ (Mark as Served)
export const markOrderAsServed = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: "SERVED" },
            include: {
                tableSession: { include: { table: true } },
                items: {
                    include: {
                        menuItem: true,
                        modifiers: { include: { modifierOption: true } }
                    }
                }
            }
        });

        // Realtime notify
        const { io } = require("../app");
        if (io) {
            io.emit("order_status_updated", updatedOrder);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Lỗi cập nhật trạng thái đơn hàng" });
    }
};
