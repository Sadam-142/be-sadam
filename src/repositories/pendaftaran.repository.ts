import db from "../db";
import type { Pendaftaran } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const pendaftaranRepository = {
  async findAll(): Promise<Pendaftaran[]> {
    const result = await db.execute("SELECT * FROM pendaftaran ORDER BY created_at DESC");
    return result.rows as unknown as Pendaftaran[];
  },

  async findById(id: number): Promise<Pendaftaran | null> {
    const result = await db.execute({
      sql: "SELECT * FROM pendaftaran WHERE id_pendaftaran = ?",
      args: [id],
    });
    return (result.rows[0] as unknown as Pendaftaran) || null;
  },

  async findByNim(nim: string): Promise<Pendaftaran | null> {
    const result = await db.execute({
      sql: "SELECT * FROM pendaftaran WHERE nim = ?",
      args: [nim],
    });
    return (result.rows[0] as unknown as Pendaftaran) || null;
  },

  async findByEmail(email: string): Promise<Pendaftaran | null> {
    const result = await db.execute({
      sql: "SELECT * FROM pendaftaran WHERE email = ?",
      args: [email],
    });
    return (result.rows[0] as unknown as Pendaftaran) || null;
  },

  async create(data: Partial<Pendaftaran>) {
    const result = await db.execute({
      sql: `INSERT INTO pendaftaran 
            (nama_lengkap, nim, angkatan, no_hp, email, fakultas, program_studi, bidang_minat, 
             tempat_lahir, tanggal_lahir, alamat_domisili, jenis_kelamin, nama_akun_ig,
             status_pendaftaran, bukti_follow_ig, bukti_follow_yt, bukti_follow_tiktok,
             bukti_pembayaran, tgl_pembayaran, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.nama_lengkap!,
        data.nim || null,
        data.angkatan || null,
        data.no_hp || null,
        data.email || null,
        data.fakultas || null,
        data.program_studi || null,
        data.bidang_minat || null,
        data.tempat_lahir || null,
        data.tanggal_lahir || null,
        data.alamat_domisili || null,
        data.jenis_kelamin || null,
        data.nama_akun_ig || null,
        data.status_pendaftaran || "pending",
        data.bukti_follow_ig || null,
        data.bukti_follow_yt || null,
        data.bukti_follow_tiktok || null,
        data.bukti_pembayaran || null,
        data.tgl_pembayaran || null,
        now(),
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateStatus(id: number, status: string) {
    await db.execute({
      sql: "UPDATE pendaftaran SET status_pendaftaran = ?, updated_at = ? WHERE id_pendaftaran = ?",
      args: [status, now(), id],
    });
  },
};
