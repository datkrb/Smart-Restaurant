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

// 2. Lấy Menu (Category -> Items -> Modifiers)
export const getGuestMenu = async (req: Request, res: Response) => {
  try {
    // Chỉ lấy Category đang Active
    // Trong mỗi Category, chỉ lấy Item đang Available hoặc Sold Out (để hiển thị hết hàng)
    // Kèm theo Modifier Groups và Options
    const categories = await prisma.category.findMany({
      where: {
        // Giả sử chỉ lấy category của nhà hàng đầu tiên hoặc truyền restaurantId
        // name: { not: "" } // Example condition
      },
      include: {
        menuItems: {
          where: {
            status: { in: ["AVAILABLE", "SOLD_OUT"] }, // Rule: Week_MenuManagement.md
          },
          include: {
            modifierGroups: {
              include: {
                options: true,
              },
            },
          },
        },
      },
      orderBy: {
        // displayOrder: 'asc' 
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Could not load menu" });
  }
};