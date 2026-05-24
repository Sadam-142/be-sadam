import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await authService.login(
      parsed.data.username,
      parsed.data.password
    );

    sendSuccess(res, "Login berhasil", result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const anggota = await require("../repositories/anggota.repository").anggotaRepository.findByIdWithPendaftaran(req.user!.id_anggota);
    if (!anggota) {
      sendError(res, "Akun tidak ditemukan", 404);
      return;
    }
    const { password, ...safeUser } = anggota;
    sendSuccess(res, "Data user", safeUser);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const parsed = require("../validators/auth.validator").updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const foto_profil = req.file?.path;

    const result = await authService.updateProfile(req.user!.id_anggota, {
      ...parsed.data,
      foto_profil,
    });
    sendSuccess(res, "Profil berhasil diupdate", result);
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const parsed = require("../validators/auth.validator").changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const result = await authService.changePassword(
      req.user!.id_anggota,
      parsed.data.oldPassword,
      parsed.data.newPassword
    );

    sendSuccess(res, "Sandi berhasil diubah", result);
  }),
};
