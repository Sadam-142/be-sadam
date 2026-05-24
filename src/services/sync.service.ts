import { kegiatanRepository } from "../repositories/kegiatan.repository";
import { kehadiranRepository } from "../repositories/kehadiran.repository";
import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { anggotaRepository } from "../repositories/anggota.repository";
import { syncQueueRepository } from "../repositories/sync-queue.repository";
import { logger } from "../utils/logger";

export const syncService = {
  /**
   * PUSH: Client → Server.
   * Process offline data from client.
   * Strategy: LAST WRITE WINS (berdasarkan updated_at).
   */
  async push(
    idAnggota: number,
    data: {
      pendaftaran?: Record<string, unknown>[];
      kehadiran?: Record<string, unknown>[];
    }
  ) {
    const results: {
      table: string;
      status: string;
      id?: number;
      error?: string;
    }[] = [];

    // Process pendaftaran
    if (data.pendaftaran && data.pendaftaran.length > 0) {
      for (const item of data.pendaftaran) {
        try {
          // Insert/update logic with conflict resolution
          await syncQueueRepository.create({
            id_anggota: idAnggota,
            table_name: "pendaftaran",
            record_id: (item.id_pendaftaran as number) || 0,
            operation: "INSERT",
            data_payload: JSON.stringify(item),
          });
          results.push({ table: "pendaftaran", status: "queued" });
        } catch (error: any) {
          results.push({
            table: "pendaftaran",
            status: "error",
            error: error.message,
          });
        }
      }
    }

    // Process kehadiran
    if (data.kehadiran && data.kehadiran.length > 0) {
      for (const item of data.kehadiran) {
        try {
          await syncQueueRepository.create({
            id_anggota: idAnggota,
            table_name: "kehadiran",
            record_id: (item.id_kehadiran as number) || 0,
            operation: "INSERT",
            data_payload: JSON.stringify(item),
          });
          results.push({ table: "kehadiran", status: "queued" });
        } catch (error: any) {
          results.push({
            table: "kehadiran",
            status: "error",
            error: error.message,
          });
        }
      }
    }

    // Update last_sync for anggota
    await anggotaRepository.updateLastSync(idAnggota);

    return results;
  },

  /**
   * PULL: Server → Client.
   * Return all data updated after last_sync timestamp.
   */
  async pull(idAnggota: number, lastSync: string) {
    const [kegiatan, kehadiran, notifikasi] = await Promise.all([
      kegiatanRepository.findUpdatedAfter(lastSync),
      kehadiranRepository.findUpdatedAfter(lastSync),
      notifikasiRepository.findUpdatedAfter(idAnggota, lastSync),
    ]);

    // Update last_sync
    await anggotaRepository.updateLastSync(idAnggota);

    return {
      kegiatan,
      kehadiran,
      notifikasi,
      synced_at: new Date().toISOString(),
    };
  },
};
