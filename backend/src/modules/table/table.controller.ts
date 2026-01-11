import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách bàn + QR Link
export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      include: { waiter: { select: { id: true, fullName: true, role: true } } },
      orderBy: { name: 'asc' }
    });

    const tablesWithQR = tables.map(table => ({
      ...table,
      qrUrl: `http://localhost:5173/?tableId=${table.id}` // URL Frontend
    }));

    res.json(tablesWithQR);
  } catch (error) {
    console.error("Error in getTables:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách bàn", details: error instanceof Error ? error.message : error });
  }
};

// 2. Tạo bàn mới
export const createTable = async (req: Request, res: Response) => {
  try {
    let { name, capacity, restaurantId, waiterId } = req.body;

    // Nếu không có restaurantId, tự động lấy Restaurant đầu tiên (dành cho bản demo/single-tenant)
    if (!restaurantId) {
      const restaurant = await prisma.restaurant.findFirst();
      if (!restaurant) {
        return res.status(400).json({ error: "Không tìm thấy nhà hàng nào trong hệ thống. Vui lòng Seed dữ liệu." });
      }
      restaurantId = restaurant.id;
    }

    const newTable = await prisma.table.create({
      data: {
        name,
        capacity: Number(capacity),
        restaurantId,
        waiterId // Gán waiter lúc tạo (nếu có)
      }
    });
    res.status(201).json(newTable);
  } catch (error) {
    console.error("Error in createTable:", error);
    res.status(500).json({ error: "Lỗi tạo bàn", details: error instanceof Error ? error.message : error });
  }
};

// 3. Cập nhật bàn (Gán Waiter, đổi tên...)
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, waiterId, isActive } = req.body;

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name,
        capacity: capacity ? Number(capacity) : undefined,
        waiterId,
        isActive
      }
    });

    res.json(updatedTable);
  } catch (error) {
    console.error("Error in updateTable:", error);
    res.status(500).json({ error: "Lỗi cập nhật bàn", details: error instanceof Error ? error.message : error });
  }
};

