import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { anggotaRepository } from "../repositories/anggota.repository";
import { AppError } from "../middleware/error.middleware";
import type { JwtPayload } from "../types";

export const authService = {
  /**
   * Login user with username and password.
   * Returns JWT token and user info.
   */
  async login(username: string, password: string) {
    // 1. Find user
    const baseAnggota = await anggotaRepository.findByUsername(username);
    if (!baseAnggota) {
      throw new AppError("Username atau password salah", 401);
    }

    // 2. Check status
    if (baseAnggota.status_anggota !== "aktif") {
      throw new AppError("Akun tidak aktif. Hubungi admin", 403);
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, baseAnggota.password);
    if (!isValid) {
      throw new AppError("Username atau password salah", 401);
    }

    // 4. Generate JWT
    const payload: JwtPayload = {
      id_anggota: baseAnggota.id_anggota,
      username: baseAnggota.username,
      role: baseAnggota.role as any,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    // 5. Return token + full user info
    const fullAnggota = await anggotaRepository.findByIdWithPendaftaran(baseAnggota.id_anggota);
    const { password: _, ...userWithoutPassword } = fullAnggota;

    return {
      token,
      user: userWithoutPassword,
    };
  },

  /**
   * Change user password.
   */
  async changePassword(idAnggota: number, oldPassword: string, newPassword: string) {
    // 1. Find user
    const anggota = await anggotaRepository.findById(idAnggota);
    if (!anggota) {
      throw new AppError("Akun tidak ditemukan", 404);
    }

    // 2. Verify old password
    const isValid = await bcrypt.compare(oldPassword, anggota.password);
    if (!isValid) {
      throw new AppError("Sandi lama salah", 400);
    }

    // 3. Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    await anggotaRepository.updatePassword(idAnggota, newHashedPassword);

    return { message: "Sandi berhasil diubah" };
  },

  /**
   * Update profile (Nama Lengkap, foto profil)
   */
  async updateProfile(idAnggota: number, data: any) {
    const anggota = await anggotaRepository.findById(idAnggota);
    if (!anggota) throw new AppError("Akun tidak ditemukan", 404);

    const db = require("../db").default;

    // Update pendaftaran (nama_lengkap, no_hp, email, alamat_domisili)
    const pendaftaranUpdates: string[] = [];
    const pendaftaranArgs: any[] = [];

    if (data.nama_lengkap !== undefined) {
      pendaftaranUpdates.push("nama_lengkap = ?");
      pendaftaranArgs.push(data.nama_lengkap);
    }
    if (data.no_hp !== undefined) {
      pendaftaranUpdates.push("no_hp = ?");
      pendaftaranArgs.push(data.no_hp);
    }
    if (data.email !== undefined) {
      pendaftaranUpdates.push("email = ?");
      pendaftaranArgs.push(data.email);
    }
    if (data.alamat_domisili !== undefined) {
      pendaftaranUpdates.push("alamat_domisili = ?");
      pendaftaranArgs.push(data.alamat_domisili);
    }

    if (pendaftaranUpdates.length > 0) {
      pendaftaranUpdates.push("updated_at = ?");
      pendaftaranArgs.push(new Date().toISOString().replace("T", " ").slice(0, 19));
      pendaftaranArgs.push(anggota.id_pendaftaran);

      await db.execute({
        sql: `UPDATE pendaftaran SET ${pendaftaranUpdates.join(", ")} WHERE id_pendaftaran = ?`,
        args: pendaftaranArgs
      });
    }

    // Update anggota (foto_profil)
    if (data.foto_profil !== undefined) {
      const anggotaSets = ["foto_profil = ?", "updated_at = ?"];
      const anggotaArgs = [
        data.foto_profil,
        new Date().toISOString().replace("T", " ").slice(0, 19),
        idAnggota
      ];

      await db.execute({
        sql: `UPDATE anggota SET ${anggotaSets.join(", ")} WHERE id_anggota = ?`,
        args: anggotaArgs
      });
    }

    return { message: "Profil berhasil diperbarui" };
  },
};
