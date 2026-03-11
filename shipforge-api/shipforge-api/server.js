import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://shipforge.dev",
    "https://www.shipforge.dev"
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);

const port = process.env.PORT || 3001;

app.listen(port, "0.0.0.0", () => {
  console.log(`Shipforge API running on port ${port}`);
});
