import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/shipforge";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Error: ADMIN_EMAIL and ADMIN_PASS environment variables are required.");
  process.exit(1);
}

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASS, 12);

  await User.create({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "ADMIN",
    subscription: "ACTIVE",
  });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
