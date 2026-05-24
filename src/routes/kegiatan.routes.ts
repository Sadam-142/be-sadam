import { Router } from "express";
import { kegiatanController } from "../controllers/kegiatan.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// POST /kegiatan — admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("pamflet"),
  kegiatanController.create
);

// GET /kegiatan/public — public
router.get("/public", kegiatanController.findAllPublic);

// GET /kegiatan — authenticated
router.get("/", authMiddleware, kegiatanController.findAll);

// GET /kegiatan/:id — authenticated
router.get("/:id", authMiddleware, kegiatanController.findById);

// PUT /kegiatan/:id — admin only
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("pamflet"),
  kegiatanController.update
);

// DELETE /kegiatan/:id — admin only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  kegiatanController.delete
);

export default router;
