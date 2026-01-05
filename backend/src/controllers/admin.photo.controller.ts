import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) return res.status(400).json({ error: "Không có file nào" });

    // Lưu thông tin từng ảnh vào DB
    const photoData = files.map(file => ({
      menuItemId: itemId,
      url: `/uploads/${file.filename}`,
      isPrimary: false
    }));

    await prisma.menuItemPhoto.createMany({ data: photoData });

    res.status(201).json({ message: "Tải ảnh lên thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải ảnh" });
  }
};

export const setPrimaryPhoto = async (req: Request, res: Response) => {
  const { photoId, itemId } = req.body;
  
  await prisma.$transaction([
    // Reset toàn bộ ảnh của món đó về false
    prisma.menuItemPhoto.updateMany({
      where: { menuItemId: itemId },
      data: { isPrimary: false }
    }),
    // Set ảnh được chọn làm Primary
    prisma.menuItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true }
    })
  ]);
  
  res.json({ message: "Đã thiết lập ảnh chính" });
};