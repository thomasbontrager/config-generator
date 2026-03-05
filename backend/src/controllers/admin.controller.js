import prisma from "../utils/prisma.js";

export const VALID_SUBSCRIPTIONS = ["FREE", "TRIAL", "ACTIVE", "CANCELLED"];

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
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateSubscription(req, res) {
  try {
    const { userId, subscription } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!subscription) {
      return res.status(400).json({ message: "subscription is required" });
    }

    if (!VALID_SUBSCRIPTIONS.includes(subscription)) {
      return res.status(400).json({
        message: `Invalid subscription value. Must be one of: ${VALID_SUBSCRIPTIONS.join(", ")}`,
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { subscription },
      select: {
        id: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("updateSubscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
