import { kegiatanRepository } from "../repositories/kegiatan.repository";
import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { anggotaRepository } from "../repositories/anggota.repository";
import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { pushService } from "./push.service";
import { AppError } from "../middleware/error.middleware";
import type {
  CreateKegiatanInput,
  UpdateKegiatanInput,
} from "../validators/kegiatan.validator";

export const kegiatanService = {
  async create(data: CreateKegiatanInput, adminId: number) {
    const idKegiatan = await kegiatanRepository.create(data);

    // Insert ke sync_queue
    await syncQueueRepository.create({
      id_anggota: adminId,
      table_name: "kegiatan",
      record_id: Number(idKegiatan),
      operation: "INSERT",
      data_payload: JSON.stringify(data),
    });

    // Kirim notifikasi ke semua anggota aktif
    try {
      const allAnggota = await anggotaRepository.findAll();
      const anggotaAktif = allAnggota.filter((a) => a.status_anggota === "aktif");

      await Promise.allSettled(
        anggotaAktif.map((anggota) =>
          notifikasiRepository.create({
            id_anggota: anggota.id_anggota,
            judul: "Kegiatan Baru UKM Risalah",
            pesan: `Ada kegiatan baru: ${data.nama_kegiatan}`,
            tipe_notifikasi: "kegiatan",
            action_url: "/kegiatan",
          })
        )
      );

      const deviceTokens = anggotaAktif
        .filter((a) => a.device_token)
        .map((a) => a.device_token!);

      if (deviceTokens.length > 0) {
        await pushService.sendMulticast(deviceTokens, {
          title: "Kegiatan Baru UKM Risalah",
          body: `Ada kegiatan baru: ${data.nama_kegiatan}`,
          url: "/kegiatan",
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    return { id_kegiatan: idKegiatan };
  },

  async findAll() {
    return kegiatanRepository.findAll();
  },

  async findById(id: number) {
    const kegiatan = await kegiatanRepository.findById(id);
    if (!kegiatan) {
      throw new AppError("Kegiatan tidak ditemukan", 404);
    }
    return kegiatan;
  },

  async update(id: number, data: UpdateKegiatanInput) {
    const existing = await kegiatanRepository.findById(id);
    if (!existing) {
      throw new AppError("Kegiatan tidak ditemukan", 404);
    }
    await kegiatanRepository.update(id, data as any);
    return { id_kegiatan: id };
  },

  async delete(id: number) {
    const existing = await kegiatanRepository.findById(id);
    if (!existing) {
      throw new AppError("Kegiatan tidak ditemukan", 404);
    }
    await kegiatanRepository.delete(id);
    return { id_kegiatan: id };
  },
};
