import { pendaftaranRepository } from "../repositories/pendaftaran.repository";
import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { anggotaRepository } from "../repositories/anggota.repository";
import { AppError } from "../middleware/error.middleware";
import type { CreatePendaftaranInput } from "../validators/pendaftaran.validator";
import { generateNoAnggota } from "../utils/generate-no-anggota";
import bcrypt from "bcryptjs";

export const pendaftaranService = {
  /**
   * Daftar anggota baru.
   * Flow: validasi unique → simpan pendaftaran → sync queue → notifikasi admin
   */
  async create(data: CreatePendaftaranInput) {
    // 1. Validasi NIM unique
    const existingNim = await pendaftaranRepository.findByNim(data.nim);
    if (existingNim) {
      throw new AppError("NIM sudah terdaftar", 409);
    }

    // 2. Validasi email unique
    const existingEmail = await pendaftaranRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError("Email sudah terdaftar", 409);
    }

    // 3. Insert pendaftaran
    const idPendaftaran = await pendaftaranRepository.create({
      ...data,
      status_pendaftaran: "pending",
    });

    // 4. Insert ke sync_queue
    // Note: id_anggota = 0 karena belum jadi anggota
    // We'll use a special admin notification approach
    try {
      await syncQueueRepository.create({
        id_anggota: 0, // system-level
        table_name: "pendaftaran",
        record_id: Number(idPendaftaran),
        operation: "INSERT",
        data_payload: JSON.stringify(data),
      });
    } catch {
      // sync queue insert failure is non-critical
    }

    return {
      id_pendaftaran: idPendaftaran,
      status_pendaftaran: "pending",
    };
  },

  async findAll() {
    return pendaftaranRepository.findAll();
  },

  async findById(id: number) {
    const pendaftaran = await pendaftaranRepository.findById(id);
    if (!pendaftaran) {
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    }
    return pendaftaran;
  },

  async updateStatus(id: number, status: string) {
    const pendaftaran = await pendaftaranRepository.findById(id);
    if (!pendaftaran) {
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    }
    
    await pendaftaranRepository.updateStatus(id, status);
    
    // Create sync queue entry
    try {
      await syncQueueRepository.create({
        id_anggota: 0,
        table_name: "pendaftaran",
        record_id: id,
        operation: "UPDATE",
        data_payload: JSON.stringify({ status_pendaftaran: status }),
      });
    } catch {
      // non critical
    }
    // Jika diterima, buat akun anggota otomatis
    if (status === "diterima") {
      const existingAnggota = await anggotaRepository.findByPendaftaranId(id);
      
      if (!existingAnggota) {
        const username = pendaftaran.nim || pendaftaran?.email?.split("@")[0];
        const defaultPassword = pendaftaran.nim ? `Risalah${pendaftaran.nim}` : "risalah123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const noAnggota = await generateNoAnggota();

        const newAnggotaId = await anggotaRepository.create({
          id_pendaftaran: id,
          no_anggota: noAnggota,
          username: username,
          password: hashedPassword,
          role: "user",
          status_anggota: "aktif",
        });

        // Buat notifikasi selamat datang
        try {
          await notifikasiRepository.create({
            id_anggota: newAnggotaId,
            judul: "Pendaftaran Diterima!",
            pesan: `Selamat datang di UKM Risalah! Akun Anda telah aktif. Username Anda: ${username}, Password: ${defaultPassword}`,
            tipe_notifikasi: "sistem",
          });
          
          await syncQueueRepository.create({
            id_anggota: newAnggotaId,
            table_name: "anggota",
            record_id: newAnggotaId,
            operation: "INSERT",
            data_payload: JSON.stringify({ id_pendaftaran: id, username, no_anggota: noAnggota }),
          });
        } catch {
          // non critical
        }
      }
    }
    
    return true;
  },
};
