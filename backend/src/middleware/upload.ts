import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// @ts-ignore: No types available
import CloudinaryStorage from 'multer-storage-cloudinary';
import path from 'path';
import { Request } from 'express';

// Configure Cloudinary
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '******' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '******' : 'MISSING'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: { v2: cloudinary },
  params: (req: Request, file: Express.Multer.File, cb: any) => {
    console.log('Starting upload for file:', file.originalname);
    try {
      const params = {
        folder: 'smart-restaurant', // Folder name in Cloudinary
        format: 'png', // or jpeg, etc.
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
      };
      console.log('Upload params:', params);
      cb(null, params);
    } catch (error) {
      console.error('Error in upload params:', error);
      cb(error);
    }
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    console.log("File Upload Debug:", { 
      filename: file.originalname, 
      mimetype: file.mimetype 
    });
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) return cb(null, true);
    cb(new Error("Chỉ hỗ trợ định dạng ảnh (jpg, png, webp)!"));
  }
});