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
  message: { message: "Too many subscription requests, please try again later" },
});

router.post("/subscribe", billingLimiter, requireAuth, createSubscription);

export default router;
