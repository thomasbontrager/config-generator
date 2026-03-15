import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createSubscription } from "../controllers/billing.controller.js";

const router = Router();

const billingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Prefer a user-based key to avoid IP-based DoS; fall back to IP if no user is available
  keyGenerator: (req) => {
    const user = req.user;
    if (user) {
      return user.id || user.userId || user.email || user.username || req.ip;
    }
    return req.ip;
  },
  message: { message: "Too many subscription requests, please try again later" },
});

router.post("/subscribe", requireAuth, billingLimiter, createSubscription);

export default router;
