import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createSubscription } from "../controllers/billing.controller.js";

const router = Router();

router.post("/subscribe", requireAuth, createSubscription);

export default router;
