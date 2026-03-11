import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import billingRoutes from "./routes/billing.js";
import adminRoutes from "./routes/admin.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .concat(["http://localhost:5173", "https://shipforge.dev", "https://www.shipforge.dev"]);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// ── Rate limiting ────────────────────────────────────────────────────────────
// Auth endpoints — strict limit to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Billing/admin endpoints — moderate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Raw body needed for Stripe webhook — must come before express.json()
app.use("/api/billing/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/billing", apiLimiter, billingRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ── Start ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 3001;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Shipforge API running on http://0.0.0.0:${port}`);
});
