import { Router } from "express";
import { pendaftaranController } from "../controllers/pendaftaran.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// POST /pendaftaran — public (calon anggota mendaftar)
router.post(
  "/",
  upload.fields([

    { name: "bukti_pembayaran", maxCount: 1 },
  ]),
  pendaftaranController.create
);

// GET /pendaftaran — admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  pendaftaranController.findAll
);

// GET /pendaftaran/:id — admin only
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  pendaftaranController.findById
);

// PATCH /pendaftaran/:id/status — admin only
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  pendaftaranController.updateStatus
);

export default router;
