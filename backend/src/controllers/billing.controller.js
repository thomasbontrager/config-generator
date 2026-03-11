import prisma from "../utils/prisma.js";

async function getPayPalToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function createSubscription(req, res) {
  try {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(503).json({ message: "PayPal is not configured" });
    }

    if (!process.env.PAYPAL_PLAN_ID) {
      return res.status(503).json({ message: "PayPal plan is not configured" });
    }

    const token = await getPayPalToken();

    const response = await fetch(
      `${process.env.PAYPAL_API}/v1/billing/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          plan_id: process.env.PAYPAL_PLAN_ID,
          application_context: {
            brand_name: process.env.BRAND_NAME || "Shipforge",
            user_action: "SUBSCRIBE_NOW",
            return_url:
              process.env.RETURN_URL ||
              "http://localhost:5173/billing/success",
            cancel_url:
              process.env.CANCEL_URL ||
              "http://localhost:5173/billing/cancel",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal subscription creation failed:", data);
      return res.status(response.status).json({
        message: "Failed to create PayPal subscription",
        details: data,
      });
    }

    // Store the pending subscription ID on the user so the webhook can link it
    if (data.id && req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { paypalSubscriptionId: data.id },
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Billing error:", error.message);
    res.status(500).json({ message: "Failed to create subscription" });
  }
}
