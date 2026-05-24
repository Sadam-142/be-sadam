import { Router } from "express";
import { notifikasiController } from "../controllers/notifikasi.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET /notifikasi/:id_anggota — authenticated
router.get(
  "/:id_anggota",
  authMiddleware,
  notifikasiController.findByAnggota
);

// PATCH /notifikasi/read — authenticated
router.patch("/read", authMiddleware, notifikasiController.markAsRead);

export default router;
