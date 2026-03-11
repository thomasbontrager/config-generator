import prisma from "../utils/prisma.js";
import { verifyPayPalWebhook } from "../utils/paypalVerify.js";

export async function handlePayPalWebhook(req, res) {
  // Verify webhook signature before processing any events
  const isValid = await verifyPayPalWebhook(req.headers, req.body);
  if (!isValid) {
    console.warn("Invalid PayPal webhook signature rejected");
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body;

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = event.resource?.id;
        const payerEmail = event.resource?.subscriber?.email_address;
        if (payerEmail) {
          await prisma.user.updateMany({
            where: { email: payerEmail },
            data: {
              subscription: "ACTIVE",
              paypalSubscriptionId: subscriptionId,
            },
          });
          console.log("Subscription activated for:", payerEmail);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = event.resource?.id;
        const payerEmail = event.resource?.subscriber?.email_address;
        if (payerEmail) {
          await prisma.user.updateMany({
            where: { email: payerEmail },
            data: { subscription: "CANCELLED" },
          });
          console.log(`Subscription ${event.event_type} for:`, payerEmail);
        } else if (subscriptionId) {
          await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: { subscription: "CANCELLED" },
          });
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        console.log("Payment completed:", event.resource?.id);
        break;
      }

      case "PAYMENT.SALE.DENIED":
      case "PAYMENT.SALE.REFUNDED": {
        console.log("Payment denied/refunded:", event.resource?.id);
        break;
      }

      default:
        console.log("Unhandled PayPal webhook event:", event.event_type);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
}
