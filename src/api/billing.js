export async function startSubscription() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/billing/subscribe", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  const approval = data.links.find(
    (link) => link.rel === "approve"
  );

  window.location.href = approval.href;
}
