import type { Request, Response } from "express";
import { presensiService } from "../services/presensi.service";
import {
  createPresensiSchema,
  verifikasiPresensiSchema,
} from "../validators/presensi.validator";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const presensiController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createPresensiSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    // Gunakan URL dari request body jika ada, jika tidak gunakan URL dari Cloudinary
    const buktiFoto = parsed.data.bukti_foto || (req.file ? req.file.path : undefined);
    
    if (!buktiFoto) {
      sendError(res, "Validasi gagal", 422, [{ path: ["bukti_foto"], message: "Bukti foto wajib dilampirkan" }]);
      return;
    }

    const result = await presensiService.create(parsed.data, buktiFoto);
    sendSuccess(res, "Presensi berhasil dicatat", result, 201);
  }),

  verifikasi: asyncHandler(async (req: Request, res: Response) => {
    const parsed = verifikasiPresensiSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await presensiService.verifikasi(
      parsed.data.id_kehadiran,
      parsed.data.status,
      req.user!.username
    );

    sendSuccess(res, "Presensi berhasil diverifikasi", result);
  }),

  findByKegiatan: asyncHandler(async (req: Request, res: Response) => {
    const idKegiatan = parseInt(String(req.params.id_kegiatan), 10);
    const data = await presensiService.findByKegiatan(idKegiatan);
    sendSuccess(res, "Data presensi kegiatan", data);
  }),

  findByAnggota: asyncHandler(async (req: Request, res: Response) => {
    const idAnggota = parseInt(String(req.params.id_anggota), 10);
    const data = await presensiService.findByAnggota(idAnggota);
    sendSuccess(res, "Data presensi anggota", data);
  }),
};
