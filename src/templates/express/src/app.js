import "dotenv/config";
import express from "express";
import cors from "cors";
import { authLimiter, apiLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import apiRoutes from "./routes/api.routes.js";

// ========================================
// ENVIRONMENT VALIDATION
// ========================================

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_API",
  "PAYPAL_WEBHOOK_ID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("\nPlease check your .env file and ensure all variables are set.");
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET must be at least 32 characters long for security.");
  process.exit(1);
}

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
app.use((err, req, res, _next) => {
  // Log error for debugging (sanitize in production)
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  } else {
    // In production, log only safe information
    console.error("Error:", {
      message: err.message,
      stack: err.stack?.split("\n")[0], // Only first line of stack
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
  
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
  console.log("✅ All security features enabled");
});

export default app;
