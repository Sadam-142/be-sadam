import { Router } from "express";
import { syncController } from "../controllers/sync.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// POST /sync/push — authenticated
router.post("/push", authMiddleware, syncController.push);

// GET /sync/pull?last_sync=timestamp — authenticated
router.get("/pull", authMiddleware, syncController.pull);

export default router;
