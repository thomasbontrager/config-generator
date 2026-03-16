import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

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

router.get("/settings/billing", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettingsRecord();

    return res.json({
      stripePublishableKey: settings.stripePublishableKey || "",
      stripeSecretKey: settings.stripeSecretKey || "",
      stripeWebhookSecret: settings.stripeWebhookSecret || "",
      stripePriceId: settings.stripePriceId || "",
      paypalClient: settings.paypalClient || "",
      paypalSecret: settings.paypalSecret || "",
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Get billing settings error:", error);
    return res.status(500).json({ message: "Failed to load billing settings" });
  }
});

router.post("/settings/billing", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettingsRecord();

    const data = {
      stripePublishableKey: req.body?.stripePublishableKey?.trim?.() || "",
      stripeSecretKey: req.body?.stripeSecretKey?.trim?.() || "",
      stripeWebhookSecret: req.body?.stripeWebhookSecret?.trim?.() || "",
      stripePriceId: req.body?.stripePriceId?.trim?.() || "",
      paypalClient: req.body?.paypalClient?.trim?.() || "",
      paypalSecret: req.body?.paypalSecret?.trim?.() || "",
    };

    const updated = await prisma.adminSettings.update({
      where: { id: settings.id },
      data,
    });

    return res.json({
      success: true,
      message: "Saved successfully",
      settings: {
        stripePublishableKey: updated.stripePublishableKey,
        stripeSecretKey: updated.stripeSecretKey,
        stripeWebhookSecret: updated.stripeWebhookSecret,
        stripePriceId: updated.stripePriceId,
        paypalClient: updated.paypalClient,
        paypalSecret: updated.paypalSecret,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Save billing settings error:", error);
    return res.status(500).json({ message: "Failed to save billing settings" });
  }
});

export default router;
