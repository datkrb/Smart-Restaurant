import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// @ts-ignore: No types available
import CloudinaryStorage from 'multer-storage-cloudinary';
import path from 'path';
import { Request } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'smart-restaurant', // Folder name in Cloudinary
      format: 'png', // or jpeg, etc.
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) return cb(null, true);
    cb(new Error("Chỉ hỗ trợ định dạng ảnh (jpg, png, webp)!"));
  }
});