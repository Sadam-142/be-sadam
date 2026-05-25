import multer, { type StorageEngine } from "multer";
import { v2 as cloudinary } from "cloudinary";

// Hapus CLOUDINARY_URL agar SDK tidak salah membaca config default dari environment
delete process.env.CLOUDINARY_URL;

const cloudinaryName = process.env.CLOUDINARY_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

if (!cloudinaryName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error("Cloudinary environment variables are incomplete");
}

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
  secure: true,
});

class CustomCloudinaryStorage implements StorageEngine {
  _handleFile(_req: any, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void) {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ukm-risalah",
        resource_type: "image",
        ...(cloudinaryUploadPreset ? { upload_preset: cloudinaryUploadPreset } : {}),
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          path: result?.secure_url,
          filename: result?.public_id,
        });
      }
    );
    stream.on("error", (error) => cb(error));
    file.stream.pipe(stream);
  }

  _removeFile(_req: any, _file: Express.Multer.File, cb: (error: Error | null) => void) {
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
