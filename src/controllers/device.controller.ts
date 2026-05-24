import type { Request, Response } from "express";
import { anggotaRepository } from "../repositories/anggota.repository";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const deviceController = {
  saveToken: asyncHandler(async (req: Request, res: Response) => {
    const { device_token } = req.body;

    if (!device_token) {
      sendError(res, "device_token wajib diisi", 400);
      return;
    }

    await anggotaRepository.updateDeviceToken(
      req.user!.id_anggota,
      device_token
    );

    sendSuccess(res, "Device token berhasil disimpan");
  }),
};
