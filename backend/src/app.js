import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { handleStripeWebhook } from "./controllers/stripe.controller.js";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "https://shipforge.dev"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Stripe webhook MUST be registered before express.json() — Stripe requires the raw body
app.post(
  "/api/billing/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

export default app;
