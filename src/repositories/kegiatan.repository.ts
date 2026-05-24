import db from "../db";
import type { Kegiatan } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const kegiatanRepository = {
  async findAll(): Promise<Kegiatan[]> {
    const result = await db.execute(
      "SELECT * FROM kegiatan ORDER BY tanggal_kegiatan DESC"
    );
    return result.rows as unknown as Kegiatan[];
  },

  async findById(id: number): Promise<Kegiatan | null> {
    const result = await db.execute({
      sql: "SELECT * FROM kegiatan WHERE id_kegiatan = ?",
      args: [id],
    });
    return (result.rows[0] as unknown as Kegiatan) || null;
  },

  async create(data: Partial<Kegiatan>) {
    const result = await db.execute({
      sql: `INSERT INTO kegiatan 
            (nama_kegiatan, jenis_kegiatan, tanggal_kegiatan, waktu_mulai, 
             waktu_selesai, lokasi, deskripsi, status_kegiatan, pamflet, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.nama_kegiatan!,
        data.jenis_kegiatan || null,
        data.tanggal_kegiatan!,
        data.waktu_mulai || null,
        data.waktu_selesai || null,
        data.lokasi || null,
        data.deskripsi || null,
        data.status_kegiatan || "aktif",
        data.pamflet || null,
        now(),
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async update(id: number, data: Partial<Kegiatan>) {
    const fields: string[] = [];
    const args: any[] = [];

    const updatableFields = [
      "nama_kegiatan", "jenis_kegiatan", "tanggal_kegiatan",
      "waktu_mulai", "waktu_selesai", "lokasi", "deskripsi",
      "status_kegiatan", "pamflet",
    ] as const;

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        args.push(data[field]);
      }
    }

    if (fields.length === 0) return;

    fields.push("updated_at = ?");
    args.push(now());
    args.push(id);

    await db.execute({
      sql: `UPDATE kegiatan SET ${fields.join(", ")} WHERE id_kegiatan = ?`,
      args,
    });
  },

  async delete(id: number) {
    await db.execute({
      sql: "DELETE FROM kegiatan WHERE id_kegiatan = ?",
      args: [id],
    });
  },

  async findUpdatedAfter(timestamp: string): Promise<Kegiatan[]> {
    const result = await db.execute({
      sql: "SELECT * FROM kegiatan WHERE updated_at > ?",
      args: [timestamp],
    });
    return result.rows as unknown as Kegiatan[];
  },
};
