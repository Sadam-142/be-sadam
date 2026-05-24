import { z } from "zod/v4";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Turso DB
  TURSO_URL: z.string().min(1, "TURSO_URL is required"),
  TURSO_API_KEY: z.string().min(1, "TURSO_API_KEY is required"),

  // JWT
  JWT_SECRET: z.string().default("risalah-ukm-secret-key-2026"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Upload
  UPLOAD_MAX_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB

  // Web Push
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
