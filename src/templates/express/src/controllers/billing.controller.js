import fetch from "node-fetch";
import { getPayPalToken } from "../utils/paypal.js";

export async function createSubscription(req, res) {
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
          brand_name: "Shipforge",
          user_action: "SUBSCRIBE_NOW",
          return_url: "http://localhost:5173/billing/success",
          cancel_url: "http://localhost:5173/billing/cancel",
        },
      }),
    }
  );

  const data = await response.json();
  res.json(data);
}
