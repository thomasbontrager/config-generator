import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  getUsers,
  updateSubscription,
  getMetrics,
  getSettings,
  saveSettings,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/users", getUsers);
router.post("/subscription", updateSubscription);
router.get("/metrics", getMetrics);
router.get("/settings", getSettings);
router.post("/settings", saveSettings);

export default router;
