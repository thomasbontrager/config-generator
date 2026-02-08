export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production environment");
}
