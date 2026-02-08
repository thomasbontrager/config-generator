import "dotenv/config";
import express from "express";
import cors from "cors";
import { authLimiter, apiLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// CORS Configuration - Locked down to specific origins
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ========================================
// RATE LIMITING
// ========================================

// Apply auth rate limiting to auth routes
app.use("/api/auth", authLimiter);

// Apply general API rate limiting
app.use("/api", apiLimiter);

// ========================================
// ROUTES
// ========================================

// Health check endpoint (no rate limit)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Webhook routes (PayPal webhooks)
app.use("/webhook", webhookRoutes);

// Protected API routes
app.use("/api", apiRoutes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (prevents information leaks)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error";
  
  res.status(err.status || 500).json({ message });
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 CORS origins: ${corsOrigins.join(", ")}`);
});

export default app;
