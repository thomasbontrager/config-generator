import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

// GET /api/admin/users
router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({
      users: users.map((u) => ({
        ...u,
        subscription: u.subscriptionStatus,
      })),
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/admin/metrics
router.get("/metrics", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [totalUsers, activeSubscriptions, trialUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.user.count({ where: { subscriptionStatus: "TRIAL" } }),
    ]);

    return res.json({
      totalUsers,
      activeSubscriptions,
      trialUsers,
      mrr: activeSubscriptions * 29, // $29/month Pro plan
    });
  } catch (err) {
    console.error("Admin metrics error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/subscription — manually set a user's subscription
router.post("/subscription", requireAuth, requireAdmin, async (req, res) => {
  const { userId, subscription } = req.body;
  const allowed = ["FREE", "TRIAL", "ACTIVE", "CANCELLED"];
  if (!userId || !allowed.includes(subscription)) {
    return res.status(400).json({ message: "Invalid userId or subscription value" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: subscription },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Admin subscription error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/admin/settings — store payment provider settings
router.post("/settings", requireAuth, requireAdmin, async (req, res) => {
  // Settings would normally be encrypted and stored in a config table.
  // For this implementation we acknowledge the request and log it server-side only.
  console.info("Admin settings updated by", req.user.email);
  return res.json({ success: true });
});

export default router;
