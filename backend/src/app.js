import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import billingRoutes from "./routes/billing.routes.js";

dotenv.config();

const app = express();

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const staticAllowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "https://shipforge.dev",
        "https://www.shipforge.dev",
      ];

  if (staticAllowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    const isHttps = protocol === "https:";
    const isShipforgeSubdomain =
      hostname === "shipforge.dev" ||
      hostname === "www.shipforge.dev" ||
      hostname.endsWith(".shipforge.dev");

    return isHttps && isShipforgeSubdomain;
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Stripe webhook must receive raw body before express.json()
app.use(
  "/api/billing/stripe/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());

// ── RATE LIMITING ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Rate limit exceeded." },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── ROUTES ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Shipforge API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, _next) => {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) console.error(err);

  res.status(err.status || 500).json({
    message: isDev ? err.message : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Shipforge API running on port ${PORT}`);
});

export default app;
