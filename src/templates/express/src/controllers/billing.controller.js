import fetch from "node-fetch";
import { getPayPalToken } from "../utils/paypal.js";

export async function createSubscription(req, res) {
  try {
    const token = await getPayPalToken();

    const response = await fetch(
      `${process.env.PAYPAL_API}/v1/billing/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: process.env.PAYPAL_PLAN_ID,
          application_context: {
            brand_name: process.env.BRAND_NAME || "Your App Name",
            user_action: "SUBSCRIBE_NOW",
            return_url: process.env.RETURN_URL || "http://localhost:5173/billing/success",
            cancel_url: process.env.CANCEL_URL || "http://localhost:5173/billing/cancel",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "PayPal subscription creation failed",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      error: "Failed to create subscription",
      message: error.message,
    });
  }
}
