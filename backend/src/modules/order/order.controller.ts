import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { tableSessionId, items } = req.body; // items là mảng các món từ giỏ hàng

        // 1. Kiểm tra session có đang mở không
        const session = await prisma.tableSession.findUnique({
            where: { id: tableSessionId },
        });
        if (!session || session.status !== "OPEN") {
            return res.status(400).json({ error: "Phiên làm việc không hợp lệ hoặc đã đóng" });
        }

        // 2. Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
        const result = await prisma.$transaction(async (tx) => {
            // Tìm hoặc tạo Order cho session này (1 bàn 1 đơn hàng)
            let order = await tx.order.findUnique({
                where: { tableSessionId: tableSessionId },
            });

            if (!order) {
                order = await tx.order.create({
                    data: {
                        tableSessionId: tableSessionId,
                        status: "RECEIVED",
                        totalAmount: 0,
                    },
                });
            }

            let orderTotalDelta = 0;

            // 3. Lặp qua từng món trong giỏ hàng để lưu vào OrderItem
            for (const item of items) {
                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        menuItemId: item.id,
                        quantity: item.quantity,
                        price: item.price, // Giá gốc tại thời điểm đặt
                        note: item.note,
                    },
                });

                let itemModifiersTotal = 0;

                // 4. Lưu các Modifier (nếu có)
                if (item.selectedModifiers) {
                    for (const groupId in item.selectedModifiers) {
                        for (const option of item.selectedModifiers[groupId]) {
                            await tx.orderItemModifier.create({
                                data: {
                                    orderItemId: orderItem.id,
                                    modifierOptionId: option.id,
                                },
                            });
                            itemModifiersTotal += option.priceDelta;
                        }
                    }
                }
                orderTotalDelta += (item.price + itemModifiersTotal) * item.quantity;
            }

            // 5. Cập nhật tổng tiền của đơn hàng và lấy full thông tin
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    totalAmount: { increment: orderTotalDelta },
                    status: "RECEIVED",
                },
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

            return updatedOrder;
        });

        // 6. Emit event cho Kitchen và Waiter (với full data)
        const { io } = require("../../app");
        if (io) {
            io.emit("new_order", result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Không thể gửi đơn hàng" });
    }
};
