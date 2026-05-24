import { kehadiranRepository } from "../repositories/kehadiran.repository";
import { anggotaRepository } from "../repositories/anggota.repository";
import db from "../db";

type DashboardPeriod = "today" | "week" | "month" | "year" | "all";

type DashboardFilters = {
  period?: DashboardPeriod;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

const resolveDateRange = (filters?: DashboardFilters) => {
  if (filters?.tanggal_dari || filters?.tanggal_sampai) {
    return {
      tanggal_dari: filters.tanggal_dari,
      tanggal_sampai: filters.tanggal_sampai,
      period: filters.period || "custom",
    };
  }

  const period = filters?.period || "month";
  if (period === "all") {
    return { tanggal_dari: undefined, tanggal_sampai: undefined, period };
  }

  const now = new Date();
  const start = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(now.getDate() - 6);
  } else if (period === "year") {
    start.setMonth(0, 1);
  } else {
    start.setDate(1);
  }

  return {
    tanggal_dari: toDateOnly(start),
    tanggal_sampai: toDateOnly(now),
    period,
  };
};

const dateWhere = (
  column: string,
  range: { tanggal_dari?: string; tanggal_sampai?: string }
) => {
  const clauses: string[] = [];
  const args: string[] = [];

  if (range.tanggal_dari) {
    clauses.push(`DATE(${column}) >= DATE(?)`);
    args.push(range.tanggal_dari);
  }

  if (range.tanggal_sampai) {
    clauses.push(`DATE(${column}) <= DATE(?)`);
    args.push(range.tanggal_sampai);
  }

  return {
    sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    args,
  };
};

const countQuery = async (sql: string, args: string[] = []) => {
  const result = await db.execute({ sql, args });
  return Number(result.rows[0]?.total || 0);
};

export const laporanService = {
  /**
   * Laporan kehadiran: JOIN anggota + kegiatan + kehadiran.
   * Filter by tanggal / kegiatan.
   */
  async getLaporanKehadiran(filters?: {
    tanggal_dari?: string;
    tanggal_sampai?: string;
    id_kegiatan?: number;
  }) {
    return kehadiranRepository.getLaporanKehadiran(filters);
  },

  /**
   * Laporan anggota: daftar anggota + statistik kehadiran.
   */
  async getLaporanAnggota() {
    const anggota = await anggotaRepository.findAllWithPendaftaran();
    return anggota;
  },

  async getDashboard(filters?: DashboardFilters) {
    const range = resolveDateRange(filters);
    const pendaftaranRange = dateWhere("created_at", range);
    const kegiatanRange = dateWhere("tanggal_kegiatan", range);
    const presensiRange = dateWhere("tgl_presensi", range);

    const [
      totalAnggota,
      pendaftarBaru,
      totalKegiatan,
      presensiHadir,
      pendingPresensi,
      tidakHadir,
      kegiatanAktif,
    ] = await Promise.all([
      countQuery("SELECT COUNT(*) AS total FROM anggota WHERE role != 'admin'"),
      countQuery(
        `SELECT COUNT(*) AS total FROM pendaftaran WHERE status_pendaftaran = 'pending'${pendaftaranRange.sql}`,
        pendaftaranRange.args
      ),
      countQuery(
        `SELECT COUNT(*) AS total FROM kegiatan WHERE 1=1${kegiatanRange.sql}`,
        kegiatanRange.args
      ),
      countQuery(
        `SELECT COUNT(*) AS total FROM kehadiran WHERE keterangan = 'hadir'${presensiRange.sql}`,
        presensiRange.args
      ),
      countQuery(
        `SELECT COUNT(*) AS total FROM kehadiran WHERE (keterangan IS NULL OR keterangan = 'pending')${presensiRange.sql}`,
        presensiRange.args
      ),
      countQuery(
        `SELECT COUNT(*) AS total FROM kehadiran WHERE keterangan = 'tidak_hadir'${presensiRange.sql}`,
        presensiRange.args
      ),
      countQuery(
        `SELECT COUNT(*) AS total FROM kegiatan WHERE status_kegiatan = 'aktif'${kegiatanRange.sql}`,
        kegiatanRange.args
      ),
    ]);

    const activityResult = await db.execute({
      sql: `
        SELECT tanggal AS date,
               SUM(kegiatan) AS kegiatan,
               SUM(presensi_hadir) AS presensi_hadir
        FROM (
          SELECT DATE(tanggal_kegiatan) AS tanggal, COUNT(*) AS kegiatan, 0 AS presensi_hadir
          FROM kegiatan
          WHERE 1=1${kegiatanRange.sql}
          GROUP BY DATE(tanggal_kegiatan)
          UNION ALL
          SELECT DATE(tgl_presensi) AS tanggal, 0 AS kegiatan, COUNT(*) AS presensi_hadir
          FROM kehadiran
          WHERE keterangan = 'hadir'${presensiRange.sql}
          GROUP BY DATE(tgl_presensi)
        )
        GROUP BY tanggal
        ORDER BY tanggal ASC
      `,
      args: [...kegiatanRange.args, ...presensiRange.args],
    });

    const pendaftaranStatusResult = await db.execute({
      sql: `
        SELECT status_pendaftaran AS status, COUNT(*) AS total
        FROM pendaftaran
        WHERE 1=1${pendaftaranRange.sql}
        GROUP BY status_pendaftaran
      `,
      args: pendaftaranRange.args,
    });

    const kegiatanByTypeResult = await db.execute({
      sql: `
        SELECT COALESCE(jenis_kegiatan, 'Lainnya') AS jenis, COUNT(*) AS total
        FROM kegiatan
        WHERE 1=1${kegiatanRange.sql}
        GROUP BY COALESCE(jenis_kegiatan, 'Lainnya')
        ORDER BY total DESC
        LIMIT 6
      `,
      args: kegiatanRange.args,
    });

    const attendanceByKegiatanResult = await db.execute({
      sql: `
        SELECT kg.id_kegiatan,
               kg.nama_kegiatan,
               kg.tanggal_kegiatan,
               kg.jenis_kegiatan,
               kg.status_kegiatan,
               COALESCE(SUM(CASE WHEN kh.keterangan = 'hadir' THEN 1 ELSE 0 END), 0) AS hadir,
               ? AS total_terdaftar
        FROM kegiatan kg
        LEFT JOIN kehadiran kh ON kh.id_kegiatan = kg.id_kegiatan
        WHERE 1=1${kegiatanRange.sql}
        GROUP BY kg.id_kegiatan, kg.nama_kegiatan, kg.tanggal_kegiatan, kg.jenis_kegiatan, kg.status_kegiatan
        ORDER BY DATE(kg.tanggal_kegiatan) DESC
        LIMIT 8
      `,
      args: [totalAnggota, ...kegiatanRange.args],
    });

    return {
      filters: range,
      summary: {
        total_anggota: totalAnggota,
        pendaftar_baru: pendaftarBaru,
        total_kegiatan: totalKegiatan,
        presensi_hadir: presensiHadir,
        pending_presensi: pendingPresensi,
        presensi_tidak_hadir: tidakHadir,
        kegiatan_aktif: kegiatanAktif,
      },
      charts: {
        activity: activityResult.rows.map((row) => ({
          date: String(row.date),
          kegiatan: Number(row.kegiatan || 0),
          presensi_hadir: Number(row.presensi_hadir || 0),
        })),
        pendaftaran_status: pendaftaranStatusResult.rows.map((row) => ({
          status: String(row.status || "unknown"),
          total: Number(row.total || 0),
        })),
        kegiatan_by_type: kegiatanByTypeResult.rows.map((row) => ({
          jenis: String(row.jenis || "Lainnya"),
          total: Number(row.total || 0),
        })),
        attendance_by_kegiatan: attendanceByKegiatanResult.rows.map((row) => ({
          id_kegiatan: Number(row.id_kegiatan),
          nama_kegiatan: String(row.nama_kegiatan || "Kegiatan"),
          tanggal_kegiatan: String(row.tanggal_kegiatan || ""),
          jenis_kegiatan: String(row.jenis_kegiatan || "Lainnya"),
          status_kegiatan: String(row.status_kegiatan || ""),
          hadir: Number(row.hadir || 0),
          total_terdaftar: Number(row.total_terdaftar || 0),
        })),
      },
    };
  },
};
