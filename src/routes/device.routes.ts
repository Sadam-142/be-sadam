import { Router } from "express";
import { deviceController } from "../controllers/device.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// POST /device-token — authenticated
router.post("/", authMiddleware, deviceController.saveToken);

export default router;
