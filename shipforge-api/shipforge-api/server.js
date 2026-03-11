import "dotenv/config";
import express from "express";
import cors from "cors";
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

// Raw body needed for Stripe webhook — must come before express.json()
app.use("/api/billing/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ── Start ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 3001;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Shipforge API running on http://0.0.0.0:${port}`);
});
