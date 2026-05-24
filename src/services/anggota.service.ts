import bcrypt from "bcryptjs";
import { anggotaRepository } from "../repositories/anggota.repository";
import { pendaftaranRepository } from "../repositories/pendaftaran.repository";
import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { generateNoAnggota } from "../utils/generate-no-anggota";
import { AppError } from "../middleware/error.middleware";
import type { UpdateAnggotaInput } from "../validators/anggota.validator";

export const anggotaService = {
  /**
   * Verifikasi pendaftaran: approve atau reject.
   * Jika approve → insert anggota, generate no_anggota, kirim notifikasi.
   * Jika reject → update status_pendaftaran = ditolak.
   */
  async verifikasi(
    idPendaftaran: number,
    status: "approve" | "reject",
    adminUsername: string
  ) {
    // 1. Cek pendaftaran exists
    const pendaftaran = await pendaftaranRepository.findById(idPendaftaran);
    if (!pendaftaran) {
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    }

    if (pendaftaran.status_pendaftaran !== "pending") {
      throw new AppError(
        `Pendaftaran sudah diproses (status: ${pendaftaran.status_pendaftaran})`,
        400
      );
    }

    if (status === "approve") {
      // 2. Generate no_anggota
      const noAnggota = await generateNoAnggota();

      // 3. Generate username from NIM or email
      const username = pendaftaran.nim || pendaftaran.email!.split("@")[0];

      // 4. Default password = NIM or "risalah123"
      const defaultPassword = pendaftaran.nim || "risalah123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // 5. Insert anggota
      const idAnggota = await anggotaRepository.create({
        id_pendaftaran: idPendaftaran,
        no_anggota: noAnggota,
        username,
        password: hashedPassword,
        role: "user",
        tanggal_aktif: new Date().toISOString().split("T")[0],
        status_anggota: "aktif",
      });

      // 6. Update status pendaftaran
      await pendaftaranRepository.updateStatus(idPendaftaran, "diterima");

      // 7. Kirim notifikasi ke anggota baru
      await notifikasiRepository.create({
        id_anggota: Number(idAnggota),
        judul: "Pendaftaran Diterima",
        pesan: `Selamat! Pendaftaran Anda telah diterima. No. Anggota: ${noAnggota}. Username: ${username}, Password default: ${defaultPassword}`,
        tipe_notifikasi: "pendaftaran",
        action_url: "/profile",
      });

      return {
        id_anggota: idAnggota,
        no_anggota: noAnggota,
        username,
        status: "diterima",
      };
    } else {
      // Reject
      await pendaftaranRepository.updateStatus(idPendaftaran, "ditolak");

      return {
        id_pendaftaran: idPendaftaran,
        status: "ditolak",
      };
    }
  },

  async findAll() {
    return anggotaRepository.findAllWithPendaftaran();
  },

  async findById(id: number) {
    const anggota = await anggotaRepository.findById(id);
    if (!anggota) {
      throw new AppError("Anggota tidak ditemukan", 404);
    }
    const { password: _, ...withoutPassword } = anggota;
    return withoutPassword;
  },

  async update(id: number, data: UpdateAnggotaInput) {
    const existing = await anggotaRepository.findById(id);
    if (!existing) {
      throw new AppError("Anggota tidak ditemukan", 404);
    }

    await anggotaRepository.update(id, data);

    try {
      await syncQueueRepository.create({
        id_anggota: 0,
        table_name: "anggota",
        record_id: id,
        operation: "UPDATE",
        data_payload: JSON.stringify(data),
      });
    } catch {
      // ignore
    }

    return { id_anggota: id };
  },

  async delete(id: number) {
    const existing = await anggotaRepository.findById(id);
    if (!existing) {
      throw new AppError("Anggota tidak ditemukan", 404);
    }

    await anggotaRepository.delete(id);

    try {
      await syncQueueRepository.create({
        id_anggota: 0,
        table_name: "anggota",
        record_id: id,
        operation: "DELETE",
        data_payload: null,
      });
    } catch {
      // ignore
    }

    return { id_anggota: id };
  },
};
