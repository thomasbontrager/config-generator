import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function BillingSuccess() {
  return (
    <>
      <div className="grid-bg" />
      <Navbar />
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div className="glass-card" style={{ padding: "48px 40px", maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Subscription Activated!
          </h1>
          <p style={{ color: "var(--success)", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>
            Your PayPal subscription has been approved.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
            You now have full access to Shipforge Pro. Check your email for a confirmation.
          </p>
          <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ marginBottom: 12 }}>
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </>
  );
}
