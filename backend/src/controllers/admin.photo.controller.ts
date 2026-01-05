import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) return res.status(400).json({ error: "Không có file nào" });

    // Lưu thông tin từng ảnh vào DB
    const photoData = files.map(file => ({
      menuItemId: itemId,
      url: `http://localhost:4000/uploads/${file.filename}`,
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

export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;

    // 1. Tìm thông tin ảnh trước khi xóa trong DB
    const photo = await prisma.menuItemPhoto.findUnique({ where: { id: photoId } });
    if (!photo) return res.status(404).json({ error: "Không tìm thấy ảnh" });

    // 2. Xóa bản ghi trong Database
    await prisma.menuItemPhoto.delete({ where: { id: photoId } });

    // 3. Xóa file vật lý trong thư mục uploads
    // Lấy tên file từ URL (VD: http://.../uploads/123.jpg -> 123.jpg)
    const fileName = photo.url.split('/').pop();
    if (fileName) {
      const filePath = path.join(__dirname, "../../uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Xóa file khỏi ổ đĩa
      }
    }

    res.json({ message: "Đã xóa ảnh thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa ảnh" });
  }
};