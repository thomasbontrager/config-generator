import { Router } from "express";
import prisma from "../utils/prisma.js";
import { verifyPayPalWebhook } from "../utils/paypalVerify.js";

const router = Router();

router.post("/paypal", async (req, res) => {
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
});

export default router;
