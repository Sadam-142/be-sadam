import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// POST /auth/login
router.post("/login", authController.login);

// GET /auth/me (protected)
router.get("/me", authMiddleware, authController.me);

// PUT /auth/change-password (protected)
router.put("/change-password", authMiddleware, authController.changePassword);

// PUT /auth/profile (protected)
router.put("/profile", authMiddleware, upload.single("foto_profil"), authController.updateProfile);

export default router;
