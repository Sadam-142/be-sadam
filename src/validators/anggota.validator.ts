import { z } from "zod";

export const updateAnggotaSchema = z.object({
  role: z.enum(["admin", "user"]).optional(),
  status_anggota: z.string().optional(),
});

export type UpdateAnggotaInput = z.infer<typeof updateAnggotaSchema>;
