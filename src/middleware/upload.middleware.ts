import multer, { StorageEngine } from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Hapus CLOUDINARY_URL agar SDK tidak salah membaca config default dari environment
delete process.env.CLOUDINARY_URL;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "didjbcinp",
  api_key: process.env.CLOUDINARY_API_KEY || "656287796896628",
  api_secret: process.env.CLOUDINARY_API_SECRET || "fIVdPGIP_ZD4NOdYaomDNOsnYe8",
  secure: true
});

class CustomCloudinaryStorage implements StorageEngine {
  _handleFile(req: any, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void) {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ukm-risalah", unsigned: true, upload_preset: "risalah_unsigned" },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          path: result?.secure_url,
          filename: result?.public_id,
        });
      }
    );
    stream.on('error', (e) => cb(e));
    file.stream.pipe(stream);
  }

  _removeFile(req: any, file: Express.Multer.File, cb: (error: Error | null) => void) {
    cb(null);
  }
}

const storage = new CustomCloudinaryStorage();

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
