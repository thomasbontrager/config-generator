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
      <p style={{ marginTop: 20, fontSize: 18 }}>
        Your subscription has been activated. Webhook will finalize the setup.
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
        }}
      >
        Go to Home
      </a>
    </div>
  );
}
