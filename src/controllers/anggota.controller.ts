import type { Request, Response } from "express";
import { anggotaService } from "../services/anggota.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";
import { updateAnggotaSchema } from "../validators/anggota.validator";

export const anggotaController = {
  verifikasi: asyncHandler(async (req: Request, res: Response) => {
    const { id_pendaftaran, status } = req.body;

    if (!id_pendaftaran || !status) {
      sendError(res, "id_pendaftaran dan status wajib diisi", 400);
      return;
    }

    if (!["approve", "reject"].includes(status)) {
      sendError(res, "Status harus 'approve' atau 'reject'", 400);
      return;
    }

    const result = await anggotaService.verifikasi(
      id_pendaftaran,
      status,
      req.user!.username
    );

    sendSuccess(
      res,
      status === "approve"
        ? "Pendaftaran berhasil diterima"
        : "Pendaftaran ditolak",
      result
    );
  }),

  findAllPublic: asyncHandler(async (_req: Request, res: Response) => {
    const data = await anggotaService.findAll();
    // Only return safe fields for public view
    const publicData = data.map((item: any) => ({
      id_anggota: item.id_anggota,
      username: item.username,
      nama_lengkap: item.nama_lengkap,
      nim: item.nim,
      status_anggota: item.status_anggota,
      angkatan: item.angkatan,
    }));
    sendSuccess(res, "Data anggota publik", publicData);
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const data = await anggotaService.findAll();
    sendSuccess(res, "Data anggota", data);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const data = await anggotaService.findById(id);
    sendSuccess(res, "Detail anggota", data);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const parsed = updateAnggotaSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await anggotaService.update(id, parsed.data);
    sendSuccess(res, "Anggota berhasil diupdate", result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const result = await anggotaService.delete(id);
    sendSuccess(res, "Anggota berhasil dihapus", result);
  }),
};
