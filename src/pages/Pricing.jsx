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
      <p style={{ marginTop: 20 }}>
        Choose a subscription plan that suits you best!
      </p>

      <div
        style={{
          marginTop: 40,
          padding: 30,
          background: "#2d2d2d",
          borderRadius: 10,
          maxWidth: 400,
        }}
      >
        <h2>Pro Plan</h2>
        <p style={{ fontSize: 32, fontWeight: "bold", marginTop: 10 }}>
          $9.99<span style={{ fontSize: 16, fontWeight: "normal" }}>/mo</span>
        </p>
        <ul style={{ marginTop: 20, lineHeight: 2 }}>
          <li>✅ All features unlocked</li>
          <li>✅ Priority support</li>
          <li>✅ 7-day free trial</li>
        </ul>
        <button
          onClick={startSubscription}
          style={{
            marginTop: 30,
            padding: "12px 24px",
            fontSize: 16,
            background: "linear-gradient(135deg, #4a9eff, #2a7dd8)",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            width: "100%",
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
