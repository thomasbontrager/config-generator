export default function BillingSuccess() {
  return (
    <div
      style={{
        padding: 32,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        background: "#1e1e1e",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>✅ Subscription Successful!</h1>
      <p style={{ marginTop: 20, fontSize: 18, color: "#4ade80" }}>
        Your PayPal subscription has been approved.
      </p>
      <p style={{ marginTop: 10, fontSize: 14, color: "#999" }}>
        You will receive a confirmation email shortly.
      </p>
      <a
        href="/"
        style={{
          marginTop: 30,
          padding: "10px 20px",
          background: "#4a9eff",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 5,
          fontSize: 16,
        }}
      >
        Go to Home
      </a>
    </div>
  );
}
