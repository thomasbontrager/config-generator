import { apiFetch } from "../config/api";

export async function startSubscription() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return "Please log in to start a subscription";
    }

    const data = await apiFetch("/api/billing/stripe/checkout", {
      method: "POST",
    });

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    return "Checkout URL not found. Please try again.";
  } catch (error) {
    console.error("Subscription error:", error);
    return error.message || "An error occurred while starting subscription. Please try again.";
  }
}
