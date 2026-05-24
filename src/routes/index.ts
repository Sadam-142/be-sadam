import { Router } from "express";
import authRoutes from "./auth.routes";
import pendaftaranRoutes from "./pendaftaran.routes";
import anggotaRoutes from "./anggota.routes";
import kegiatanRoutes from "./kegiatan.routes";
import presensiRoutes from "./presensi.routes";
import laporanRoutes from "./laporan.routes";
import syncRoutes from "./sync.routes";
import notifikasiRoutes from "./notifikasi.routes";
import deviceRoutes from "./device.routes";

const router = Router();

// API root — daftar endpoint
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "BE-SADAM API — Sistem Informasi Keanggotaan UKM Risalah",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth (login, me)",
      pendaftaran: "/api/pendaftaran",
      anggota: "/api/anggota",
      kegiatan: "/api/kegiatan",
      presensi: "/api/presensi",
      laporan: "/api/laporan",
      sync: "/api/sync (push, pull)",
      notifikasi: "/api/notifikasi",
      device_token: "/api/device-token",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/pendaftaran", pendaftaranRoutes);
router.use("/anggota", anggotaRoutes);
router.use("/kegiatan", kegiatanRoutes);
router.use("/presensi", presensiRoutes);
router.use("/laporan", laporanRoutes);
router.use("/sync", syncRoutes);
router.use("/notifikasi", notifikasiRoutes);
router.use("/device-token", deviceRoutes);

export default router;
