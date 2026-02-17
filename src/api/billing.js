export async function startSubscription() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in to start a subscription.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/billing/subscribe", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();

    if (!data.links || !Array.isArray(data.links)) {
      throw new Error("Invalid response format from billing API");
    }

    const approval = data.links.find((link) => link.rel === "approve");

    if (!approval || !approval.href) {
      throw new Error("Approval link not found in response");
    }

    window.location.href = approval.href;
  } catch (error) {
    console.error("Subscription error:", error);
    alert("Failed to start subscription. Please try again later.");
  }
}
