import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách đơn hàng (hỗ trợ lọc theo status)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const whereCondition = status ? { status: status as OrderStatus } : {};

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        tableSession: {
          include: { table: true } // Để lấy tên bàn
        },
        items: {
          include: {
            menuItem: true,
            modifiers: { include: { modifierOption: true } } // Để lấy chi tiết món và option (Size, Topping)
          }
        }
      },
      orderBy: { createdAt: 'asc' } // Đơn cũ nhất hiện lên đầu (FIFO)
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách đơn hàng" });
  }
};

// 2. Cập nhật trạng thái đơn hàng (Duyệt/Từ chối/Nấu xong)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
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
    res.status(500).json({ error: "Không thể cập nhật trạng thái đơn hàng" });
  }
};