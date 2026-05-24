import type { Request, Response } from "express";
import { notifikasiService } from "../services/notifikasi.service";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const notifikasiController = {
  findByAnggota: asyncHandler(async (req: Request, res: Response) => {
    const idAnggota = parseInt(String(req.params.id_anggota), 10);
    const data = await notifikasiService.findByAnggota(idAnggota);
    sendSuccess(res, "Data notifikasi", data);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const { id_notifikasi } = req.body;

    if (id_notifikasi) {
      const result = await notifikasiService.markAsRead(id_notifikasi);
      sendSuccess(res, "Notifikasi ditandai sudah dibaca", result);
    } else {
      // Mark all as read for the authenticated user
      const result = await notifikasiService.markAllAsRead(
        req.user!.id_anggota
      );
      sendSuccess(res, "Semua notifikasi ditandai sudah dibaca", result);
    }
  }),
};
