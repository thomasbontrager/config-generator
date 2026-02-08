import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireActiveSubscription } from "../middleware/subscription.middleware.js";

const router = Router();

router.post(
  "/generate",
  requireAuth,
  requireActiveSubscription,
  (req, res) => {
    res.json({ message: "Generator access granted" });
  }
);

export default router;
