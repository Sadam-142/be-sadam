import type { Request, Response } from "express";
import { kegiatanService } from "../services/kegiatan.service";
import {
  createKegiatanSchema,
  updateKegiatanSchema,
} from "../validators/kegiatan.validator";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const kegiatanController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (req.file) {
      req.body.pamflet = req.file.path;
    }
    const parsed = createKegiatanSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await kegiatanService.create(
      parsed.data,
      req.user!.id_anggota
    );
    sendSuccess(res, "Kegiatan berhasil dibuat", result, 201);
  }),

  findAllPublic: asyncHandler(async (_req: Request, res: Response) => {
    // Fetch activities, excluding cancelled ones
    const data = await kegiatanService.findAll();
    const activeData = data.filter(k => k.status_kegiatan !== "dibatalkan");
    sendSuccess(res, "Data kegiatan publik", activeData);
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const data = await kegiatanService.findAll();
    sendSuccess(res, "Data kegiatan", data);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const data = await kegiatanService.findById(id);
    sendSuccess(res, "Detail kegiatan", data);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    if (req.file) {
      req.body.pamflet = req.file.path;
    }
    const parsed = updateKegiatanSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await kegiatanService.update(id, parsed.data);
    sendSuccess(res, "Kegiatan berhasil diupdate", result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const result = await kegiatanService.delete(id);
    sendSuccess(res, "Kegiatan berhasil dihapus", result);
  }),
};
