import db from "../db";
import type { Notifikasi } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const notifikasiRepository = {
  async findByAnggota(idAnggota: number): Promise<Notifikasi[]> {
    const result = await db.execute({
      sql: "SELECT * FROM notifikasi WHERE id_anggota = ? ORDER BY created_at DESC",
      args: [idAnggota],
    });
    return result.rows as unknown as Notifikasi[];
  },

  async create(data: Partial<Notifikasi>) {
    const result = await db.execute({
      sql: `INSERT INTO notifikasi 
            (id_anggota, judul, pesan, tipe_notifikasi, action_url, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.id_anggota!,
        data.judul || null,
        data.pesan || null,
        data.tipe_notifikasi || null,
        data.action_url || null,
        now(),
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async markAsRead(idNotifikasi: number) {
    await db.execute({
      sql: "UPDATE notifikasi SET terbaca = 1, read_at = ?, updated_at = ? WHERE id_notifikasi = ?",
      args: [now(), now(), idNotifikasi],
    });
  },

  async markAllAsRead(idAnggota: number) {
    await db.execute({
      sql: "UPDATE notifikasi SET terbaca = 1, read_at = ?, updated_at = ? WHERE id_anggota = ? AND terbaca = 0",
      args: [now(), now(), idAnggota],
    });
  },

  async findUpdatedAfter(
    idAnggota: number,
    timestamp: string
  ): Promise<Notifikasi[]> {
    const result = await db.execute({
      sql: "SELECT * FROM notifikasi WHERE id_anggota = ? AND updated_at > ?",
      args: [idAnggota, timestamp],
    });
    return result.rows as unknown as Notifikasi[];
  },
};
