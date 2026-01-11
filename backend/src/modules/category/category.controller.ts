import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Lấy danh sách danh mục
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: { select: { menuItems: true } } // Đếm số món trong danh mục
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách danh mục" });
    }
};

// 2. Tạo danh mục mới
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, restaurantId } = req.body;

        // Validate cơ bản
        if (!name || !restaurantId) return res.status(400).json({ error: "Thiếu thông tin" });

        const category = await prisma.category.create({
            data: { name, restaurantId }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: "Không thể tạo danh mục" });
    }
};

// 3. Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await prisma.category.update({
            where: { id },
            data: { name }
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Lỗi cập nhật danh mục" });
    }
};

// 4. Xóa danh mục
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id } });
        res.json({ message: "Đã xóa danh mục thành công" });
    } catch (error) {
        res.status(500).json({ error: "Không thể xóa (có thể danh mục đang chứa món ăn)" });
    }
};
