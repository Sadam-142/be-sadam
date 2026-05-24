import { Router } from "express";
import { laporanController } from "../controllers/laporan.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

// GET /laporan/dashboard - admin only
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  laporanController.dashboard
);

// GET /laporan/kehadiran - admin only
router.get(
  "/kehadiran",
  authMiddleware,
  roleMiddleware("admin"),
  laporanController.kehadiran
);

// GET /laporan/anggota - admin only
router.get(
  "/anggota",
  authMiddleware,
  roleMiddleware("admin"),
  laporanController.anggota
);

export default router;
