const API_BASE = import.meta.env.VITE_API_URL || "";

export async function startSubscription() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to start a subscription");
      return;
    }

    const res = await fetch(`${API_BASE}/api/billing/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.message || "Failed to create subscription");
      return;
    }

    const data = await res.json();

    // PayPal subscription — follow approval link
    const approval = data.links?.find((link) => link.rel === "approve");
    if (approval?.href) {
      window.location.href = approval.href;
      return;
    }

    // Stripe checkout session — redirect to hosted page
    if (data.url) {
      window.location.href = data.url;
      return;
    }

    alert("Subscription approval URL not found");
  } catch (error) {
    console.error("Subscription error:", error);
    alert("An error occurred while starting subscription. Please try again.");
  }
}
