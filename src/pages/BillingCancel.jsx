import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function BillingCancel() {
  return (
    <>
      <div className="grid-bg" />
      <Navbar />
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "100px 24px",
          textAlign: "center",
          animation: "fadeInUp 0.6s ease both",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 24, filter: "drop-shadow(0 0 20px rgba(239,68,68,0.5))" }}>
          ❌
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 900,
            marginBottom: 16,
            letterSpacing: "-0.03em",
          }}
        >
          Subscription <span style={{ color: "var(--danger)" }}>Cancelled</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 40 }}>
          No charges have been made. You can subscribe anytime to unlock
          all Shipforge features.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/pricing" className="btn btn-primary btn-lg">
            View Plans →
          </Link>
          <Link to="/" className="btn btn-secondary btn-lg">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

