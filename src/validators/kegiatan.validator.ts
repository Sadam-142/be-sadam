import { z } from "zod/v4";

export const createKegiatanSchema = z.object({
  nama_kegiatan: z.string().min(1, "Nama kegiatan wajib diisi"),
  jenis_kegiatan: z.string().optional(),
  tanggal_kegiatan: z.string().min(1, "Tanggal kegiatan wajib diisi"),
  waktu_mulai: z.string().optional(),
  waktu_selesai: z.string().optional(),
  lokasi: z.string().optional(),
  deskripsi: z.string().optional(),
  status_kegiatan: z.string().default("aktif"),
  pamflet: z.string().optional(),
});

export const updateKegiatanSchema = createKegiatanSchema.partial();

export type CreateKegiatanInput = z.infer<typeof createKegiatanSchema>;
export type UpdateKegiatanInput = z.infer<typeof updateKegiatanSchema>;
