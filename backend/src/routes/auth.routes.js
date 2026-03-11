import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);

export default router;
