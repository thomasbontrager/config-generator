import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error("Error: ADMIN_EMAIL and ADMIN_PASS environment variables are required.");
  process.exit(1);
}

async function createAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASS, 12);

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      subscription: "ACTIVE",
    },
  });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  await prisma.$disconnect();
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  prisma.$disconnect();
  process.exit(1);
});
