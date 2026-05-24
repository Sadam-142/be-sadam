import { z } from "zod/v4";

export const syncPushSchema = z.object({
  pendaftaran: z.array(z.record(z.string(), z.unknown())).optional(),
  kehadiran: z.array(z.record(z.string(), z.unknown())).optional(),
});

export type SyncPushInput = z.infer<typeof syncPushSchema>;
