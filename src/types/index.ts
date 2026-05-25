// =========================================
// Shared Types for be-sadam
// =========================================

// --- Pendaftaran ---
export interface Pendaftaran {
  id_pendaftaran: number;
  nama_lengkap: string;
  nim: string | null;
  angkatan: string | null;
  no_hp: string | null;
  email: string | null;
  program_studi: string | null;
  bidang_minat: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat_domisili: string | null;
  fakultas: string | null;
  jenis_kelamin: "L" | "P" | null;
  nama_akun_ig: string | null;
  tgl_pendaftaran: string;
  status_pendaftaran: string;

  bukti_pembayaran: string | null;
  tgl_pembayaran: string | null;
  created_at: string;
  updated_at: string;
}

// --- Anggota ---
export interface Anggota {
  id_anggota: number;
  id_pendaftaran: number;
  no_anggota: string | null;
  username: string;
  password: string;
  role: "admin" | "user";
  tanggal_aktif: string | null;
  status_anggota: string;
  last_sync: string | null;
  device_token: string | null;
  enable_notification: number;
  foto_profil: string | null;
  created_at: string;
  updated_at: string;
}

// --- Kegiatan ---
export interface Kegiatan {
  id_kegiatan: number;
  nama_kegiatan: string;
  jenis_kegiatan: string | null;
  tanggal_kegiatan: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  lokasi: string | null;
  deskripsi: string | null;
  status_kegiatan: string;
  pamflet: string | null;
  created_at: string;
  updated_at: string;
}

// --- Kehadiran ---
export interface Kehadiran {
  id_kehadiran: number;
  id_anggota: number;
  id_kegiatan: number;
  tgl_presensi: string;
  waktu_presensi: string;
  keterangan: string | null;
  bukti_foto: string | null;
  latitude: number | null;
  longitude: number | null;
  diverifikasi_oleh: string | null;
  sync_status: string;
  created_at: string;
  updated_at: string;
}

// --- Notifikasi ---
export interface Notifikasi {
  id_notifikasi: number;
  id_anggota: number;
  judul: string | null;
  pesan: string | null;
  tipe_notifikasi: string | null;
  terbaca: number;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

// --- SyncQueue ---
export interface SyncQueue {
  id_sync: number;
  id_anggota: number;
  table_name: string;
  record_id: number;
  operation: "INSERT" | "UPDATE" | "DELETE";
  data_payload: string | null;
  sync_status: string;
  retry_count: number;
  created_at: string;
  synced_at: string | null;
}

// --- JWT Payload ---
export interface JwtPayload {
  id_anggota: number;
  username: string;
  role: "admin" | "user";
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}
