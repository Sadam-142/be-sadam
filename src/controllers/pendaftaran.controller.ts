import type { Request, Response } from "express";
import { pendaftaranService } from "../services/pendaftaran.service";
import { createPendaftaranSchema } from "../validators/pendaftaran.validator";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const pendaftaranController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    // Handling multiple file uploads via upload.fields
    if (req.files && typeof req.files === "object") {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      

      if (files["bukti_pembayaran"]?.[0]) {
        req.body.bukti_pembayaran = files["bukti_pembayaran"][0].path;
      }
    }

    const parsed = createPendaftaranSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await pendaftaranService.create(parsed.data);
    sendSuccess(res, "Pendaftaran berhasil dikirim", result, 201);
  }),

  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const data = await pendaftaranService.findAll();
    sendSuccess(res, "Data pendaftaran", data);
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const data = await pendaftaranService.findById(id);
    sendSuccess(res, "Detail pendaftaran", data);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(String(req.params.id), 10);
    const { status } = req.body;
    
    if (!status || !["diterima", "ditolak", "pending"].includes(status)) {
      sendError(res, "Status tidak valid", 400);
      return;
    }
    
    // update status di database
    await pendaftaranService.updateStatus(id, status);
    sendSuccess(res, `Status pendaftaran berhasil diubah menjadi ${status}`);
  }),
};
