import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Error: ADMIN_EMAIL and ADMIN_PASS environment variables are required.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function createAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email: ADMIN_EMAIL }, data: { role: "ADMIN" } });
      console.log(`User ${ADMIN_EMAIL} promoted to ADMIN.`);
    } else {
      console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASS, 12);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashed,
      role: "ADMIN",
      subscription: "ACTIVE",
    },
  });

  console.log(`Admin user ${ADMIN_EMAIL} created successfully.`);
}

createAdmin()
  .catch((err) => {
    console.error("Failed to create admin:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
