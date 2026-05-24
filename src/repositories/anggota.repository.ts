import db from "../db";
import type { Anggota } from "../types";

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

export const anggotaRepository = {
  async findAll(): Promise<Anggota[]> {
    const result = await db.execute(
      "SELECT * FROM anggota ORDER BY created_at DESC"
    );
    return result.rows as unknown as Anggota[];
  },

  async findById(id: number): Promise<Anggota | null> {
    const result = await db.execute({
      sql: "SELECT * FROM anggota WHERE id_anggota = ?",
      args: [id],
    });
    return (result.rows[0] as unknown as Anggota) || null;
  },

  async findByUsername(username: string): Promise<Anggota | null> {
    const result = await db.execute({
      sql: "SELECT * FROM anggota WHERE username = ?",
      args: [username],
    });
    return (result.rows[0] as unknown as Anggota) || null;
  },

  async findByIdWithPendaftaran(id: number) {
    const result = await db.execute({
      sql: `SELECT a.*, p.nama_lengkap, p.nim, p.email, p.angkatan, p.program_studi, 
                   p.no_hp, p.jenis_kelamin, p.bidang_minat, p.tempat_lahir, p.tanggal_lahir, 
                   p.alamat_domisili, p.fakultas, p.nama_akun_ig
            FROM anggota a
            JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
            WHERE a.id_anggota = ?`,
      args: [id],
    });
    return result.rows[0] || null;
  },

  async findByPendaftaranId(idPendaftaran: number): Promise<Anggota | null> {
    const result = await db.execute({
      sql: "SELECT * FROM anggota WHERE id_pendaftaran = ?",
      args: [idPendaftaran],
    });
    return (result.rows[0] as unknown as Anggota) || null;
  },

  async create(data: Partial<Anggota>) {
    const result = await db.execute({
      sql: `INSERT INTO anggota 
            (id_pendaftaran, no_anggota, username, password, role, tanggal_aktif, 
             status_anggota, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.id_pendaftaran!,
        data.no_anggota || null,
        data.username!,
        data.password!,
        data.role || "user",
        data.tanggal_aktif || new Date().toISOString().split("T")[0],
        data.status_anggota || "aktif",
        now(),
        now(),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateDeviceToken(idAnggota: number, deviceToken: string) {
    await db.execute({
      sql: "UPDATE anggota SET device_token = ?, updated_at = ? WHERE id_anggota = ?",
      args: [deviceToken, now(), idAnggota],
    });
  },

  async updateLastSync(idAnggota: number) {
    await db.execute({
      sql: "UPDATE anggota SET last_sync = ?, updated_at = ? WHERE id_anggota = ?",
      args: [now(), now(), idAnggota],
    });
  },

  async updateStatus(idAnggota: number, status: string) {
    await db.execute({
      sql: "UPDATE anggota SET status_anggota = ?, updated_at = ? WHERE id_anggota = ?",
      args: [status, now(), idAnggota],
    });
  },

  async updatePassword(idAnggota: number, newHashedPassword: string) {
    await db.execute({
      sql: "UPDATE anggota SET password = ?, updated_at = ? WHERE id_anggota = ?",
      args: [newHashedPassword, now(), idAnggota],
    });
  },

  async findAllWithPendaftaran() {
    const result = await db.execute(
      `SELECT a.*, p.nama_lengkap, p.nim, p.email, p.angkatan, p.program_studi, 
              p.no_hp, p.jenis_kelamin, p.bidang_minat, p.tempat_lahir, p.tanggal_lahir, 
              p.alamat_domisili, p.fakultas, p.nama_akun_ig
       FROM anggota a
       JOIN pendaftaran p ON a.id_pendaftaran = p.id_pendaftaran
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  },

  async update(id: number, data: { role?: string; status_anggota?: string }) {
    const sets: string[] = [];
    const args: any[] = [];

    if (data.role !== undefined) {
      sets.push("role = ?");
      args.push(data.role);
    }
    if (data.status_anggota !== undefined) {
      sets.push("status_anggota = ?");
      args.push(data.status_anggota);
    }

    if (sets.length === 0) return;

    sets.push("updated_at = ?");
    args.push(now());
    args.push(id);

    await db.execute({
      sql: `UPDATE anggota SET ${sets.join(", ")} WHERE id_anggota = ?`,
      args,
    });
  },

  async delete(id: number) {
    await db.execute({
      sql: "DELETE FROM anggota WHERE id_anggota = ?",
      args: [id],
    });
  },
};
