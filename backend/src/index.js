import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET environment variable is required");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Shipforge API running on port ${PORT}`);
});
