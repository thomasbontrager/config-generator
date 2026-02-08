import fetch from "node-fetch";

export async function getPayPalToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal authentication failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  
  if (!data.access_token) {
    throw new Error("PayPal authentication failed: No access token received");
  }
  
  return data.access_token;
}
