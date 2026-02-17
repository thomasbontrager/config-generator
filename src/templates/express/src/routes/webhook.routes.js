import { Router } from "express";
import prisma from "../utils/prisma.js";
import { verifyPayPalWebhook } from "../utils/paypalVerify.js";
import { webhookLimiter } from "../middleware/rateLimit.js";

const router = Router();

// Apply rate limiting to webhook endpoint
router.post("/paypal", webhookLimiter, async (req, res) => {
  try {
    const isValid = await verifyPayPalWebhook(req.headers, req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      const subId = event.resource.id;

      await prisma.user.updateMany({
        where: { paypalSubId: subId },
        data: { subscription: "ACTIVE" },
      });
    }

    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subId = event.resource.id;

      await prisma.user.updateMany({
        where: { paypalSubId: subId },
        data: { subscription: "CANCELED" },
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
