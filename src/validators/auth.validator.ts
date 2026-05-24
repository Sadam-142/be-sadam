import { z } from "zod/v4";

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Sandi lama wajib diisi"),
  newPassword: z.string().min(6, "Sandi baru minimal 6 karakter"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap tidak boleh kosong").optional(),
  no_hp: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  alamat_domisili: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
