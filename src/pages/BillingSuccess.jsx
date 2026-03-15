import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function BillingSuccess() {
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
        <div style={{ fontSize: 64, marginBottom: 24, filter: "drop-shadow(0 0 20px rgba(16,185,129,0.6))" }}>
          ✅
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 900,
            marginBottom: 16,
            letterSpacing: "-0.03em",
          }}
        >
          Subscription <span className="gradient-text">Activated!</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 40 }}>
          Welcome to Pro! Your subscription has been approved. Start generating
          production-ready stacks immediately.
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-lg generator-btn">
          Go to Dashboard →
        </Link>
      </div>
    </>
  );
}

