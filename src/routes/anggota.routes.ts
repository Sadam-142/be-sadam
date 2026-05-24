import { Router } from "express";
import { anggotaController } from "../controllers/anggota.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

// POST /anggota/verifikasi — admin only
router.post(
  "/verifikasi",
  authMiddleware,
  roleMiddleware("admin"),
  anggotaController.verifikasi
);

// GET /anggota/public — public
router.get("/public", anggotaController.findAllPublic);

// GET /anggota — admin only
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  anggotaController.findAll
);

// GET /anggota/:id — authenticated
router.get("/:id", authMiddleware, anggotaController.findById);

// PUT /anggota/:id — admin only
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  anggotaController.update
);

// DELETE /anggota/:id — admin only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  anggotaController.delete
);

export default router;
