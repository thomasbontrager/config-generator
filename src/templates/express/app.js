import express from "express";
import dotenv from "dotenv";
import billingRoutes from "./src/routes/billing.routes.js";
import webhookRoutes from "./src/routes/webhook.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/billing", billingRoutes);
app.use("/api/webhooks", webhookRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
