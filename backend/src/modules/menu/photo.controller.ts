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

// Don't need BACKEND_URL anymore for Cloudinary
        // const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

        // Lưu thông tin từng ảnh vào DB
        const photoData = files.map(file => ({
            menuItemId: itemId,
            url: (file as any).secure_url,
            isPrimary: false
        }));

        await prisma.menuItemPhoto.createMany({ data: photoData });

        res.status(201).json({ message: "Tải ảnh lên thành công" });
    } catch (error) {
        console.error("Upload error:", error);
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

        // 3. (Optional) Xóa file trên Cloudinary -> Cần dùng Cloudinary API riêng
        // Phần xóa file local cũ không còn tác dụng với ảnh mới, giữ lại check file local để xóa ảnh cũ (backward compatibility)
        if (photo.url.includes('/uploads/')) {
             const fileName = photo.url.split('/').pop();
             if (fileName) {
                 const filePath = path.join(__dirname, "../../../uploads", fileName);
                 if (fs.existsSync(filePath)) {
                     fs.unlinkSync(filePath); // Xóa file cũ còn sót lại
                 }
             }
        }
        // TODO: Implement Cloudinary deletion if needed

        res.json({ message: "Đã xóa ảnh thành công" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa ảnh" });
    }
};
