import db from "../db";
import type { Kehadiran } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const kehadiranRepository = {
  async findAll(): Promise<Kehadiran[]> {
    const result = await db.execute(
      "SELECT * FROM kehadiran ORDER BY created_at DESC"
    );
    return result.rows as unknown as Kehadiran[];
  },

  async findById(id: number): Promise<Kehadiran | null> {
    const result = await db.execute({
      sql: "SELECT * FROM kehadiran WHERE id_kehadiran = ?",
      args: [id],
    });
    return (result.rows[0] as unknown as Kehadiran) || null;
  },

  async findByAnggotaAndKegiatan(
    idAnggota: number,
    idKegiatan: number
  ): Promise<Kehadiran | null> {
    const result = await db.execute({
      sql: "SELECT * FROM kehadiran WHERE id_anggota = ? AND id_kegiatan = ?",
      args: [idAnggota, idKegiatan],
    });
    return (result.rows[0] as unknown as Kehadiran) || null;
  },

  async create(data: Partial<Kehadiran>) {
    const result = await db.execute({
      sql: `INSERT INTO kehadiran 
            (id_anggota, id_kegiatan, tgl_presensi, waktu_presensi, keterangan, 
             bukti_foto, latitude, longitude, sync_status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.id_anggota!,
        data.id_kegiatan!,
        data.tgl_presensi || new Date().toISOString().split("T")[0],
        data.waktu_presensi || now(),
        data.keterangan || null,
        data.bukti_foto || null,
        data.latitude || null,
        data.longitude || null,
        data.sync_status || "pending",
        now(),
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateVerifikasi(
    id: number,
    keterangan: string,
    diverifikasiOleh: string
  ) {
    await db.execute({
      sql: `UPDATE kehadiran 
            SET keterangan = ?, diverifikasi_oleh = ?, sync_status = 'synced', updated_at = ? 
            WHERE id_kehadiran = ?`,
      args: [keterangan, diverifikasiOleh, now(), id],
    });
  },

  async findByKegiatan(idKegiatan: number) {
    const result = await db.execute({
      sql: `SELECT k.*, a.no_anggota, p.nama_lengkap, p.nim
            FROM kehadiran k
            JOIN anggota a ON k.id_anggota = a.id_anggota
            JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
            WHERE k.id_kegiatan = ?
            ORDER BY k.waktu_presensi DESC`,
      args: [idKegiatan],
    });
    return result.rows;
  },

  async findByAnggota(idAnggota: number) {
    const result = await db.execute({
      sql: `SELECT k.*, kg.nama_kegiatan, kg.tanggal_kegiatan, kg.lokasi
            FROM kehadiran k
            JOIN kegiatan kg ON k.id_kegiatan = kg.id_kegiatan
            WHERE k.id_anggota = ?
            ORDER BY k.waktu_presensi DESC`,
      args: [idAnggota],
    });
    return result.rows;
  },

  async findUpdatedAfter(timestamp: string): Promise<Kehadiran[]> {
    const result = await db.execute({
      sql: "SELECT * FROM kehadiran WHERE updated_at > ?",
      args: [timestamp],
    });
    return result.rows as unknown as Kehadiran[];
  },

  /** Laporan kehadiran with JOIN anggota + kegiatan, with optional filters */
  async getLaporanKehadiran(filters?: {
    tanggal_dari?: string;
    tanggal_sampai?: string;
    id_kegiatan?: number;
  }) {
    let sql = `
      SELECT k.*, 
             a.no_anggota, p.nama_lengkap, p.nim, p.program_studi,
             kg.nama_kegiatan, kg.tanggal_kegiatan, kg.lokasi
      FROM kehadiran k
      JOIN anggota a ON k.id_anggota = a.id_anggota
      JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
      JOIN kegiatan kg ON k.id_kegiatan = kg.id_kegiatan
      WHERE 1=1
    `;
    const args: any[] = [];

    if (filters?.tanggal_dari) {
      sql += " AND kg.tanggal_kegiatan >= ?";
      args.push(filters.tanggal_dari);
    }
    if (filters?.tanggal_sampai) {
      sql += " AND kg.tanggal_kegiatan <= ?";
      args.push(filters.tanggal_sampai);
    }
    if (filters?.id_kegiatan) {
      sql += " AND k.id_kegiatan = ?";
      args.push(filters.id_kegiatan);
    }

    sql += " ORDER BY kg.tanggal_kegiatan DESC, k.waktu_presensi DESC";

    const result = await db.execute({ sql, args });
    return result.rows;
  },
};
