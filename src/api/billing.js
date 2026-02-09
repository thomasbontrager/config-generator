export async function startSubscription() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to start a subscription");
      return;
    }

    const res = await fetch("http://localhost:5000/api/billing/subscribe", {
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

    const approval = data.links?.find(
      (link) => link.rel === "approve"
    );

    if (!approval?.href) {
      alert("PayPal approval URL not found");
      return;
    }

    window.location.href = approval.href;
  } catch (error) {
    console.error("Subscription error:", error);
    alert("An error occurred while starting subscription. Please try again.");
  }
}
