import { API_URL } from "../config/api";

export async function startSubscription() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to start a subscription");
      return;
    }

    const res = await fetch(`${API_URL}/api/billing/stripe/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      alert((data && data.message) || `Failed to create checkout session (${res.status})`);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    alert("Stripe checkout URL not found");
  } catch (error) {
    console.error("Subscription error:", error);
    alert("An error occurred while starting subscription. Please try again.");
  }
}

export async function getBillingState() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const res = await fetch(`${API_URL}/api/billing/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.user || null;
}
