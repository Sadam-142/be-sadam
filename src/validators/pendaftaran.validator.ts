import { z } from "zod/v4";

export const createPendaftaranSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nim: z.string().min(1, "NIM wajib diisi"),
  angkatan: z.string().optional(),
  no_hp: z.string().optional(),
  email: z.email("Format email tidak valid"),
  fakultas: z.string().optional(),
  program_studi: z.string().optional(),
  // Terima string (comma-separated) atau array, normalisasi jadi string
  bidang_minat: z
    .union([
      z.string(),
      z.array(z.string()).transform((arr) => arr.join(", ")),
    ])
    .optional(),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  alamat_domisili: z.string().optional(),
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  nama_akun_ig: z.string().optional(),
  bukti_follow_ig: z.string().optional(),
  bukti_follow_yt: z.string().optional(),
  bukti_follow_tiktok: z.string().optional(),
  bukti_pembayaran: z.string().optional(),
  tgl_pembayaran: z.string().optional(),
});

export type CreatePendaftaranInput = z.infer<typeof createPendaftaranSchema>;
