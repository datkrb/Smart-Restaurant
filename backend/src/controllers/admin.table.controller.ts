import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách bàn + QR Link
export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' }
    });

    const tablesWithQR = tables.map(table => ({
      ...table,
      qrUrl: `http://localhost:5173/?tableId=${table.id}` // URL Frontend
    }));

    res.json(tablesWithQR);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách bàn" });
  }
};

// 2. Tạo bàn mới
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, capacity, restaurantId } = req.body;
    const newTable = await prisma.table.create({
      data: { name, capacity: Number(capacity), restaurantId }
    });
    res.status(201).json(newTable);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo bàn" });
  }
};