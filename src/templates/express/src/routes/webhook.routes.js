import { Router } from "express";

const router = Router();

router.post("/paypal", (req, res) => {
  const event = req.body;

  // ⚠️ SECURITY WARNING: Webhook signature verification is NOT implemented.
  // This code MUST NOT be used in production without implementing PayPal webhook
  // signature verification. Without it, attackers can forge webhook events.
  // See: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-webhook-signature

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    // TODO: update user.subscription = "active"
    console.log("Subscription activated:", event.resource?.id);
  }

  if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
    // TODO: update user.subscription = "canceled"
    console.log("Subscription cancelled:", event.resource?.id);
  }

  res.sendStatus(200);
});

export default router;
