import { kehadiranRepository } from "../repositories/kehadiran.repository";
import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { anggotaRepository } from "../repositories/anggota.repository";
import { pushService } from "./push.service";
import { AppError } from "../middleware/error.middleware";
import type { CreatePresensiInput } from "../validators/presensi.validator";

export const presensiService = {
  /**
   * Create presensi.
   * Flow: check double presensi → simpan → sync queue
   */
  async create(data: CreatePresensiInput, buktiFoto?: string) {
    // 1. Check double presensi (UNIQUE constraint)
    const existing = await kehadiranRepository.findByAnggotaAndKegiatan(
      data.id_anggota,
      data.id_kegiatan
    );

    if (existing) {
      throw new AppError(
        "Anda sudah melakukan presensi untuk kegiatan ini",
        409
      );
    }

    // 2. Insert kehadiran
    const idKehadiran = await kehadiranRepository.create({
      id_anggota: data.id_anggota,
      id_kegiatan: data.id_kegiatan,
      tgl_presensi: new Date().toISOString().split("T")[0],
      keterangan: data.keterangan || null,
      bukti_foto: buktiFoto || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      sync_status: "pending",
    });

    // 3. Insert ke sync_queue
    await syncQueueRepository.create({
      id_anggota: data.id_anggota,
      table_name: "kehadiran",
      record_id: Number(idKehadiran),
      operation: "INSERT",
      data_payload: JSON.stringify(data),
    });

    return { id_kehadiran: idKehadiran };
  },

  /**
   * Verifikasi presensi oleh admin.
   * Approve/Reject kehadiran → update status → kirim notifikasi
   */
  async verifikasi(
    idKehadiran: number,
    status: string,
    adminUsername: string
  ) {
    const kehadiran = await kehadiranRepository.findById(idKehadiran);
    if (!kehadiran) {
      throw new AppError("Data kehadiran tidak ditemukan", 404);
    }

    await kehadiranRepository.updateVerifikasi(
      idKehadiran,
      status,
      adminUsername
    );

    // Kirim notifikasi ke anggota
    await notifikasiRepository.create({
      id_anggota: kehadiran.id_anggota,
      judul: "Presensi Diverifikasi",
      pesan: `Presensi Anda telah diverifikasi dengan status: ${status}`,
      tipe_notifikasi: "presensi",
      action_url: "/presensi",
    });

    // Kirim push notification ke anggota
    try {
      const anggota = await anggotaRepository.findById(kehadiran.id_anggota);
      if (anggota && anggota.device_token) {
        await pushService.sendNotification(anggota.device_token, {
          title: "Presensi Diverifikasi",
          body: `Presensi Anda telah diverifikasi dengan status: ${status}`,
          url: "/riwayat",
        });
      }
    } catch (error) {
      console.error("Failed to send push notification:", error);
    }

    return { id_kehadiran: idKehadiran, status };
  },

  async findByKegiatan(idKegiatan: number) {
    return kehadiranRepository.findByKegiatan(idKegiatan);
  },

  async findByAnggota(idAnggota: number) {
    return kehadiranRepository.findByAnggota(idAnggota);
  },
};
