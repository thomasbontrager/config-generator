import { Router } from "express";
import rateLimit from "express-rate-limit";
import { handlePayPalWebhook } from "../controllers/webhook.controller.js";

const router = Router();

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many webhook requests" },
});

router.post("/paypal", webhookLimiter, handlePayPalWebhook);

export default router;
