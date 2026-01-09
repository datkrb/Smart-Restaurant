import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Khởi tạo hoặc lấy Session hiện tại của bàn
export const startSession = async (req: Request, res: Response) => {
  try {
    const { tableId } = req.body;
    console.log("Đang nhận tableId:", tableId);

    // Kiểm tra bàn có tồn tại không
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) return res.status(404).json({ error: "Table not found" });

    // Tìm session đang mở (OPEN) của bàn này
    let session = await prisma.tableSession.findFirst({
      where: {
        tableId: tableId,
        status: "OPEN",
      },
    });

    // Nếu chưa có, tạo mới
    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId: tableId,
          status: "OPEN",
        },
      });
    }

    res.json(session);
  } catch (error) {
    console.error("LỖI BACKEND CHI TIẾT:", error);
    res.status(500).json({ error: "Could not start session" });
  }
};

// 2. API lấy danh sách Category (Chỉ để hiển thị thanh lọc)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh mục" });
  }
};

// 3. API lấy món ăn nâng cao (Search, Filter, Sort, Pagination)
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, categoryId, isChefRecommended } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Xây dựng điều kiện lọc
    const where: any = {
      status: { in: ["AVAILABLE", "SOLD_OUT"] } // Lấy cả món hết hàng để khách biết
    };

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = String(categoryId);
    }

    if (isChefRecommended === 'true') {
      where.isChefRecommended = true;
    }

    // Query Database
    const items = await prisma.menuItem.findMany({
      where,
      take: Number(limit),
      skip,
      include: {
        photos: true,
        modifierGroups: {
          include: { options: true }
        }
      },
      orderBy: [
        // Ưu tiên Chef choice lên đầu
        { isChefRecommended: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Trả về kèm thông tin phân trang
    res.json({
      data: items,
      hasMore: items.length === Number(limit)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi lấy thực đơn" });
  }
};

// 4. Lấy chi tiết đơn hàng (Order Tracking)
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { tableSessionId } = req.params;

    const order = await prisma.order.findUnique({
      where: { tableSessionId },
      include: {
        items: {
          include: {
            menuItem: true,
            modifiers: { include: { modifierOption: true } }
          }
        },
        tableSession: {
          include: { table: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not get order details" });
  }
};

// 5. Yêu cầu thanh toán
export const requestBill = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { billRequested: true }
    });

    // Emit socket event to notify waiter
    try {
      const { io } = require("../app");
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