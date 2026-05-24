import type { Request, Response } from "express";
import { syncService } from "../services/sync.service";
import { syncPushSchema } from "../validators/sync.validator";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

export const syncController = {
  push: asyncHandler(async (req: Request, res: Response) => {
    const parsed = syncPushSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validasi gagal", 422, parsed.error.issues);
      return;
    }

    const results = await syncService.push(
      req.user!.id_anggota,
      parsed.data
    );
    sendSuccess(res, "Sync push berhasil", results);
  }),

  pull: asyncHandler(async (req: Request, res: Response) => {
    const lastSync = (req.query.last_sync as string) || "1970-01-01T00:00:00";

    const data = await syncService.pull(req.user!.id_anggota, lastSync);
    sendSuccess(res, "Sync pull berhasil", data);
  }),
};
