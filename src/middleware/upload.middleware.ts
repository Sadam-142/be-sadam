import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { resolve } from "path";
import dotenv from "dotenv";

// Hapus CLOUDINARY_URL agar SDK tidak salah membaca config default dari environment
delete process.env.CLOUDINARY_URL;

cloudinary.config({
  cloud_name: "didjbcinp",
  api_key: "851542653881134",
  api_secret: "h9XwmTaRe952BOF0ECkXUoM1khY",
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ukm-risalah",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any, // TypeScript workaround for params
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
