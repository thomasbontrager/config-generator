import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const base = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";

  if (!clientId || !secret) {
    throw new Error("PayPal credentials not configured");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await res.json();
  return data.access_token;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// POST /api/billing/subscribe — create a PayPal subscription
router.post("/subscribe", requireAuth, async (req, res) => {
  try {
    const planId = process.env.PAYPAL_PLAN_ID;
    if (!planId) {
      return res.status(500).json({ message: "PayPal plan ID not configured" });
    }

    const accessToken = await getPayPalAccessToken();
    const base = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
    const origin = req.headers.origin || process.env.CORS_ORIGIN || "https://shipforge.dev";

    const response = await fetch(`${base}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          email_address: req.user.email,
        },
        application_context: {
          brand_name: "Shipforge",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/billing/success`,
          cancel_url: `${origin}/billing/cancel`,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("PayPal subscription error:", err);
      return res.status(502).json({ message: "Failed to create PayPal subscription" });
    }

    const subscription = await response.json();
    return res.json(subscription);
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

// POST /api/billing/stripe/checkout — create a Stripe checkout session
router.post("/stripe/checkout", requireAuth, async (req, res) => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!stripeKey || !priceId) {
      return res.status(500).json({ message: "Stripe not configured" });
    }

    // Dynamically import stripe to avoid hard dependency if not using Stripe
    const { default: Stripe } = await import("stripe").catch(() => ({ default: null }));
    if (!Stripe) {
      return res.status(500).json({ message: "Stripe module not available" });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
    const origin = req.headers.origin || process.env.CORS_ORIGIN || "https://shipforge.dev";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      metadata: { userId: req.user.id },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

// POST /api/billing/stripe/webhook — Stripe webhook handler
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const { default: Stripe } = await import("stripe").catch(() => ({ default: null }));
  if (!Stripe) {
    return res.status(500).json({ message: "Stripe module not available" });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      : JSON.parse(req.body.toString());
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).json({ message: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const user = await prisma.user.findFirst({
          where: { subscriptionId: sub.customer },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: sub.status === "active" ? "ACTIVE" : "TRIAL",
              renewalDate: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.user.updateMany({
          where: { subscriptionId: sub.customer },
          data: { subscriptionStatus: "CANCELED" },
        });
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const user = await prisma.user.findFirst({
          where: { subscriptionId: invoice.customer },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: "ACTIVE" },
          });
        }
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
});

// POST /api/billing/paypal/webhook — PayPal webhook handler
router.post("/paypal/webhook", async (req, res) => {
  try {
    const event = req.body;

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = event.resource?.id;
        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { subscriptionId },
            data: { subscriptionStatus: "ACTIVE" },
          });
        }
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = event.resource?.id;
        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { subscriptionId },
            data: { subscriptionStatus: "CANCELED" },
          });
        }
        break;
      }
      default:
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
});

// POST /api/billing/paypal/success — capture PayPal subscription after approval
router.post("/paypal/success", requireAuth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ message: "Missing subscriptionId" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscriptionId,
        subscriptionStatus: "ACTIVE",
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("PayPal success error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
