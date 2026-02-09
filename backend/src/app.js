import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import generatorRoutes from "./routes/generator.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/generator", generatorRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ShipForge API is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ShipForge backend running on http://localhost:${PORT}`);
});

export default app;
