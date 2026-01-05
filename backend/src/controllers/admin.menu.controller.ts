import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách món ăn (Photos, Filter và Sorting)
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { categoryId, status, search } = req.query;

    const where: any = {
      // Logic Soft Delete: Không lấy các món đã đánh dấu là "Xóa" (nếu bạn thêm status DELETED)

    };
    
    if (categoryId) where.categoryId = String(categoryId);
    if (status) where.status = status;
    if (search) where.name = { contains: String(search), mode: 'insensitive' };

    const items = await prisma.menuItem.findMany({
      where,
      include: { 
        category: true, 
        photos: true 
      },
      orderBy: { createdAt: 'desc' } // Sorting: Mới nhất lên đầu
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
        price: Number(price),
        description,
        categoryId,
        isChefRecommended: Boolean(isChefRecommended),
        status: "AVAILABLE"
      },
      include: { photos: true } // Trả về kèm mảng ảnh rỗng để tránh lỗi UI
    });
    res.status(201).json(newItem);
  } catch (error) {
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
    
    // Thay vì dùng prisma.menuItem.delete, ta cập nhật status
    // Điều này giúp các Order cũ trong quá khứ không bị lỗi khi tham chiếu đến món này
    await prisma.menuItem.update({
      where: { id },
      data: { status: "UNAVAILABLE" } 
    });
    
    res.json({ message: "Đã chuyển trạng thái món sang không khả dụng (Soft Deleted)" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xử lý xóa món ăn" });
  }
};