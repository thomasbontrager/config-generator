import prisma from "../utils/prisma.js";

export async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function updateSubscription(req, res) {
  try {
    const { userId, subscription } = req.body;

    const validStatuses = ["FREE", "TRIAL", "ACTIVE", "CANCELLED"];
    if (!validStatuses.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription status" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { subscription },
    });

    res.json({ success: true, user: updated });
  } catch {
    res.status(500).json({ message: "Failed to update subscription" });
  }
}

export async function getMetrics(req, res) {
  try {
    const [totalUsers, activeSubscriptions, trialUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscription: "ACTIVE" } }),
      prisma.user.count({ where: { subscription: "TRIAL" } }),
    ]);

    const mrr = activeSubscriptions * 29; // $29/month per active sub

    res.json({ totalUsers, activeSubscriptions, trialUsers, mrr });
  } catch {
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
}

export async function getSettings(req, res) {
  try {
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      settings = { stripeKey: "", paypalClient: "", paypalSecret: "", webhookSecret: "" };
    }
    // Never return actual secrets — return masked values
    res.json({
      stripeKey: settings.stripeKey ? "••••••••" : "",
      paypalClient: settings.paypalClient ? "••••••••" : "",
      paypalSecret: settings.paypalSecret ? "••••••••" : "",
      webhookSecret: settings.webhookSecret ? "••••••••" : "",
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}

export async function saveSettings(req, res) {
  try {
    const { stripeKey, paypalClient, paypalSecret, webhookSecret } = req.body;

    const existing = await prisma.adminSettings.findFirst();
    if (existing) {
      await prisma.adminSettings.update({
        where: { id: existing.id },
        data: {
          ...(stripeKey && stripeKey !== "••••••••" ? { stripeKey } : {}),
          ...(paypalClient && paypalClient !== "••••••••" ? { paypalClient } : {}),
          ...(paypalSecret && paypalSecret !== "••••••••" ? { paypalSecret } : {}),
          ...(webhookSecret && webhookSecret !== "••••••••" ? { webhookSecret } : {}),
        },
      });
    } else {
      await prisma.adminSettings.create({
        data: {
          stripeKey: stripeKey || "",
          paypalClient: paypalClient || "",
          paypalSecret: paypalSecret || "",
          webhookSecret: webhookSecret || "",
        },
      });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to save settings" });
  }
}
