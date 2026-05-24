import { Router } from "express";
import { presensiController } from "../controllers/presensi.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// POST /presensi — authenticated (anggota presensi)
router.post(
  "/",
  authMiddleware,
  upload.single("bukti_foto"),
  presensiController.create
);

// POST /presensi/verifikasi — admin only
router.post(
  "/verifikasi",
  authMiddleware,
  roleMiddleware("admin"),
  presensiController.verifikasi
);

// GET /presensi/kegiatan/:id_kegiatan — authenticated
router.get(
  "/kegiatan/:id_kegiatan",
  authMiddleware,
  presensiController.findByKegiatan
);

// GET /presensi/anggota/:id_anggota — authenticated
router.get(
  "/anggota/:id_anggota",
  authMiddleware,
  presensiController.findByAnggota
);

export default router;
