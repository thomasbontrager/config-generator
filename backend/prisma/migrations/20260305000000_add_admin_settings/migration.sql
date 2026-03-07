-- AlterTable: Add Stripe fields to User
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateTable: AdminSettings
CREATE TABLE "AdminSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stripeKey" TEXT NOT NULL DEFAULT '',
    "paypalClient" TEXT NOT NULL DEFAULT '',
    "paypalSecret" TEXT NOT NULL DEFAULT '',
    "webhookSecret" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
