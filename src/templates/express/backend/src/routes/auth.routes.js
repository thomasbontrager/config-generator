import express from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// TODO: Add rate limiting middleware to prevent brute force attacks
// Example: npm install express-rate-limit
// import rateLimit from "express-rate-limit";
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
// router.post("/signup", authLimiter, signup);
// router.post("/login", authLimiter, login);

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
