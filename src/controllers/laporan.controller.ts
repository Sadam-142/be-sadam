import type { Request, Response } from "express";
import { laporanService } from "../services/laporan.service";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const laporanController = {
  dashboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await laporanService.getDashboard({
      period: req.query.period as
        | "today"
        | "week"
        | "month"
        | "year"
        | "all"
        | undefined,
      tanggal_dari: req.query.tanggal_dari as string | undefined,
      tanggal_sampai: req.query.tanggal_sampai as string | undefined,
    });

    sendSuccess(res, "Statistik dashboard admin", data);
  }),

  kehadiran: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      tanggal_dari: req.query.tanggal_dari as string | undefined,
      tanggal_sampai: req.query.tanggal_sampai as string | undefined,
      id_kegiatan: req.query.id_kegiatan
        ? parseInt(req.query.id_kegiatan as string, 10)
        : undefined,
    };

    const data = await laporanService.getLaporanKehadiran(filters);
    sendSuccess(res, "Laporan kehadiran", data);
  }),

  anggota: asyncHandler(async (_req: Request, res: Response) => {
    const data = await laporanService.getLaporanAnggota();
    sendSuccess(res, "Laporan anggota", data);
  }),
};
