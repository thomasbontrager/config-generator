export default function BillingCancel() {
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
      <h1>❌ Subscription Cancelled</h1>
      <p style={{ marginTop: 20, fontSize: 18 }}>
        You cancelled the subscription process. No charges were made.
      </p>
      <a
        href="/pricing"
        style={{
          marginTop: 30,
          padding: "10px 20px",
          background: "#4a9eff",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 5,
        }}
      >
        Back to Pricing
      </a>
    </div>
  );
}
