import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createStripeCheckout } from "../controllers/stripe.controller.js";

const router = Router();

const billingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many subscription requests, please try again later" },
});

// POST /api/billing/stripe/checkout — create a Stripe checkout session
router.post("/stripe/checkout", billingLimiter, requireAuth, createStripeCheckout);

export default router;
