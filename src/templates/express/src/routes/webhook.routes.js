import { Router } from "express";

const router = Router();

router.post("/paypal", (req, res) => {
  const event = req.body;

  // TODO: verify signature (next hardening step)

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    // update user.subscription = "active"
  }

  if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
    // update user.subscription = "canceled"
  }

  res.sendStatus(200);
});

export default router;
