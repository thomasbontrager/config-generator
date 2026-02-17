import { startSubscription } from "../api/billing";

export default function Pricing() {
  return (
    <div
      style={{
        padding: 32,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        background: "#1e1e1e",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1>💰 Pricing</h1>
      <p style={{ marginTop: 10, color: "#aaa" }}>
        Choose a subscription plan that suits you best!
      </p>

      <div
        style={{
          marginTop: 40,
          maxWidth: 400,
          padding: 30,
          background: "#2d2d2d",
          borderRadius: 10,
          border: "2px solid #4a9eff",
        }}
      >
        <h2 style={{ color: "#4a9eff", marginBottom: 10 }}>Pro Plan</h2>
        <p style={{ fontSize: 32, fontWeight: "bold", marginBottom: 10 }}>
          $9.99<span style={{ fontSize: 16, color: "#aaa" }}>/month</span>
        </p>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 30 }}>
          <li style={{ marginBottom: 8 }}>✅ Unlimited config generation</li>
          <li style={{ marginBottom: 8 }}>✅ Priority support</li>
          <li style={{ marginBottom: 8 }}>✅ Advanced templates</li>
          <li style={{ marginBottom: 8 }}>✅ 7-day free trial</li>
        </ul>
        <button
          onClick={startSubscription}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "linear-gradient(135deg, #4a9eff, #2a7dd8)",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          Start Free Trial
        </button>
      </div>

      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: 30,
          color: "#4a9eff",
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </a>
    </div>
  );
}
