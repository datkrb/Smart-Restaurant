import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách món ăn (có Filter)
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId: String(categoryId) } : {};

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách món" });
  }
};

// 2. Tạo món ăn mới
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId, isChefRecommended } = req.body;

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        price: Number(price), // Đảm bảo kiểu số
        description,
        categoryId,
        isChefRecommended: Boolean(isChefRecommended),
        status: "AVAILABLE"
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Không thể tạo món mới" });
  }
};

// 3. Cập nhật món (Giá, Trạng thái, Hết hàng)
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body; // Gửi lên { price: 50000, status: 'SOLD_OUT', ... }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật món" });
  }
};

// 4. Xóa món
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: "Đã xóa món ăn" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa món ăn" });
  }
};