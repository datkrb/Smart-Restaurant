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

// // 3. Lấy Menu (Category -> Items -> Modifiers)
// export const getGuestMenu = async (req: Request, res: Response) => {
//   try {
//     // Chỉ lấy Category đang Active
//     // Trong mỗi Category, chỉ lấy Item đang Available hoặc Sold Out (để hiển thị hết hàng)
//     // Kèm theo Modifier Groups và Options
//     const categories = await prisma.category.findMany({
//       where: {
//         // Giả sử chỉ lấy category của nhà hàng đầu tiên hoặc truyền restaurantId
//         // name: { not: "" } // Example condition
//       },
//       include: {
//         menuItems: {
//           where: {
//             status: { in: ["AVAILABLE", "SOLD_OUT"] }, // Rule: Week_MenuManagement.md
//           },
//           include: {
//             modifierGroups: {
//               include: {
//                 options: true,
//               },
//             },
//             photos: true
//           },
//         },
//       },
//       orderBy: {
//         // displayOrder: 'asc' 
//         name: "asc",
//       },
//     });

//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ error: "Could not load menu" });
//   }
// };

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