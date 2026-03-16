import { Router } from "express";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import prisma from "../utils/prisma.js";

const router = Router();

async function requireAuth(req, res, next) {
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

    req.user = user;
    next();
  } catch (error) {
    console.error("Billing auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function getAdminSettings() {
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

function getAppOrigin(req) {
  const originHeader = req.headers.origin;
  if (originHeader) return originHeader;

  if (process.env.APP_URL) return process.env.APP_URL;
  return "https://shipforge.dev";
}

router.post("/stripe/checkout", requireAuth, async (req, res) => {
  try {
    const settings = await getAdminSettings();

    const stripeSecretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    const stripePriceId = settings.stripePriceId || process.env.STRIPE_PRICE_ID;

    if (!stripeSecretKey) {
      return res.status(500).json({ message: "Stripe secret key is not configured" });
    }

    if (!stripePriceId) {
      return res.status(500).json({ message: "Stripe price ID is not configured" });
    }

    const stripe = new Stripe(stripeSecretKey);

    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    const origin = getAppOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      allow_promotion_codes: true,
      metadata: {
        userId: req.user.id,
      },
      subscription_data: {
        metadata: {
          userId: req.user.id,
        },
      },
    });

    return res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create Stripe checkout session",
    });
  }
});

router.post("/stripe/webhook", async (req, res) => {
  try {
    const settings = await getAdminSettings();

    const stripeSecretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret =
      settings.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return res.status(500).json({ message: "Stripe secret key is not configured" });
    }

    const stripe = new Stripe(stripeSecretKey);

    let event;
    const signature = req.headers["stripe-signature"];

    if (stripeWebhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
    } else {
      event = JSON.parse(req.body.toString("utf8"));
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session?.metadata?.userId;
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;
        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscription: "ACTIVE",
              stripeCustomerId: stripeCustomerId || undefined,
              stripeSubscriptionId: stripeSubscriptionId || undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;
        const stripeCustomerId =
          typeof subscription.customer === "string" ? subscription.customer : null;

        let nextStatus = "ACTIVE";
        if (subscription.status === "trialing") nextStatus = "TRIAL";
        if (subscription.status === "past_due") nextStatus = "PAST_DUE";
        if (subscription.status === "unpaid") nextStatus = "PAST_DUE";
        if (subscription.status === "canceled") nextStatus = "CANCELED";
        if (subscription.status === "incomplete") nextStatus = "PENDING";

        await prisma.user.updateMany({
          where: {
            OR: [
              { stripeSubscriptionId },
              ...(stripeCustomerId ? [{ stripeCustomerId }] : []),
            ],
          },
          data: {
            subscription: nextStatus,
            stripeSubscriptionId,
            ...(stripeCustomerId ? { stripeCustomerId } : {}),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;

        await prisma.user.updateMany({
          where: { stripeSubscriptionId },
          data: {
            subscription: "CANCELED",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeSubscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : null;

        if (stripeSubscriptionId) {
          await prisma.user.updateMany({
            where: { stripeSubscriptionId },
            data: {
              subscription: "PAST_DUE",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const stripeSubscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : null;

        if (stripeSubscriptionId) {
          await prisma.user.updateMany({
            where: { stripeSubscriptionId },
            data: {
              subscription: "ACTIVE",
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).json({
      message: error.message || "Stripe webhook failed",
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const freshUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        subscription: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ user: freshUser });
  } catch (error) {
    console.error("Billing /me error:", error);
    return res.status(500).json({ message: "Failed to load billing state" });
  }
});

export default router;
