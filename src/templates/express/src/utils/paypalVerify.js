import fetch from "node-fetch";

export async function verifyPayPalWebhook(headers, body) {
  try {
    const tokenRes = await fetch(
      `${process.env.PAYPAL_API}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!tokenRes.ok) {
      console.error("PayPal token request failed:", tokenRes.status);
      return false;
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("No access token in PayPal response");
      return false;
    }

    const res = await fetch(
      `${process.env.PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: body,
        }),
      }
    );

    if (!res.ok) {
      console.error("PayPal verification request failed:", res.status);
      return false;
    }

    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("PayPal webhook verification error:", error.message);
    return false;
  }
}
