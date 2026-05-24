import { z } from "zod/v4";

export const createPresensiSchema = z.object({
  id_anggota: z.coerce.number().min(1, "ID anggota wajib"),
  id_kegiatan: z.coerce.number().min(1, "ID kegiatan wajib"),
  keterangan: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  bukti_foto: z.string().optional(),
});

export const verifikasiPresensiSchema = z.object({
  id_kehadiran: z.coerce.number().min(1, "ID kehadiran wajib"),
  status: z.enum(["hadir", "tidak_hadir", "izin"], {
    message: "Status harus hadir, tidak_hadir, atau izin",
  }),
});

export type CreatePresensiInput = z.infer<typeof createPresensiSchema>;
export type VerifikasiPresensiInput = z.infer<typeof verifikasiPresensiSchema>;
