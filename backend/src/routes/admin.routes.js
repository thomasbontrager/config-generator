import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import {
  getUsers,
  updateSubscription,
  getMetrics,
} from "../controllers/admin.controller.js";

const router = Router();

async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function getSettingsRecord() {
  let settings = await prisma.adminSettings.findFirst({
    orderBy: { id: "asc" },
  });

  if (!settings) {
    settings = await prisma.adminSettings.create({
      data: {},
    });
  }

  return settings;
}

router.get("/users", requireAdmin, getUsers);
router.get("/metrics", requireAdmin, getMetrics);
router.post("/subscription", requireAdmin, updateSubscription);

router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettingsRecord();

    return res.json({
      stripeSecretKey: settings.stripeSecretKey ? "••••••••" : "",
      stripeWebhookSecret: settings.stripeWebhookSecret ? "••••••••" : "",
      stripePriceId: settings.stripePriceId || "",
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ message: "Failed to load settings" });
  }
});

router.post("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettingsRecord();

    const data = {};
    const { stripeSecretKey, stripeWebhookSecret, stripePriceId } = req.body || {};

    if (stripeSecretKey && stripeSecretKey !== "••••••••") {
      data.stripeSecretKey = stripeSecretKey.trim();
    }
    if (stripeWebhookSecret && stripeWebhookSecret !== "••••••••") {
      data.stripeWebhookSecret = stripeWebhookSecret.trim();
    }
    if (stripePriceId !== undefined) {
      data.stripePriceId = stripePriceId.trim();
    }

    await prisma.adminSettings.update({
      where: { id: settings.id },
      data,
    });

    return res.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Save settings error:", error);
    return res.status(500).json({ message: "Failed to save settings" });
  }
});

export default router;
