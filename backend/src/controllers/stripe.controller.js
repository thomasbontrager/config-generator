import Stripe from "stripe";
import prisma from "../utils/prisma.js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe not configured");
  }
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

// POST /api/billing/stripe/checkout
export async function createStripeCheckout(req, res) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!process.env.STRIPE_SECRET_KEY || !priceId) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const stripe = getStripe();
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
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to create checkout session" });
  }
}

// POST /api/billing/stripe/webhook  (raw body — registered before express.json)
export async function handleStripeWebhook(req, res) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  let event;
  try {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.warn("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        if (userId) {
          try {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscription: "ACTIVE",
                stripeCustomerId: customerId ?? undefined,
                stripeSubscriptionId: subscriptionId ?? undefined,
              },
            });
            console.log("checkout.session.completed: activated user", userId);
          } catch (updateErr) {
            console.error(
              `checkout.session.completed: failed to update user ${userId}:`,
              updateErr.message
            );
            throw updateErr;
          }
        } else {
          console.warn("checkout.session.completed: no userId in session metadata", session.id);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const status = sub.status === "active" || sub.status === "trialing" ? "ACTIVE" : "CANCELLED";
        const result = await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { subscription: status },
        });
        if (result.count === 0) {
          console.warn(`${event.type}: no user found for subscription ${sub.id}`);
        } else {
          console.log(`${event.type}: subscription ${sub.id} -> ${status} (${result.count} user(s))`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const result = await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { subscription: "CANCELLED" },
        });
        if (result.count === 0) {
          console.warn(`customer.subscription.deleted: no user found for subscription ${sub.id}`);
        } else {
          console.log(`customer.subscription.deleted: ${sub.id} cancelled (${result.count} user(s))`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (subId) {
          const result = await prisma.user.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { subscription: "ACTIVE" },
          });
          if (result.count === 0) {
            console.warn("invoice.payment_succeeded: no user found for subscription", subId);
          } else {
            console.log("invoice.payment_succeeded for subscription:", subId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (subId) {
          // Keep current status — Stripe will retry; log for visibility
          console.warn("invoice.payment_failed for subscription:", subId);
        }
        break;
      }

      default:
        console.log("Unhandled Stripe event:", event.type);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error.message);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
}
