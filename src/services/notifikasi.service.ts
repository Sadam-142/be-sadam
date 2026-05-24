import { notifikasiRepository } from "../repositories/notifikasi.repository";
import { AppError } from "../middleware/error.middleware";

export const notifikasiService = {
  async findByAnggota(idAnggota: number) {
    return notifikasiRepository.findByAnggota(idAnggota);
  },

  async markAsRead(idNotifikasi: number) {
    await notifikasiRepository.markAsRead(idNotifikasi);
    return { id_notifikasi: idNotifikasi };
  },

  async markAllAsRead(idAnggota: number) {
    await notifikasiRepository.markAllAsRead(idAnggota);
    return { id_anggota: idAnggota };
  },
};
