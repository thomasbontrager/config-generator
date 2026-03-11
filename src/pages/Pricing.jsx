import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startSubscription } from "../api/billing";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscribeError, setSubscribeError] = useState("");

  async function handleSubscribe() {
    if (!user) {
      navigate("/signup");
      return;
    }
    setSubscribeError("");
    try {
      await startSubscription();
    } catch (err) {
      setSubscribeError(err.message || "Failed to start subscription. Please try again.");
    }
  }

  return (
    <>
      <div className="grid-bg" />
      <Navbar />

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "64px 24px 80px",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span
            style={{
              display: "inline-block",
              padding: "3px 14px",
              borderRadius: 100,
              background: "var(--gradient)",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 20,
            }}
          >
            Pricing
          </span>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Simple,{" "}
            <span className="gradient-text">transparent</span> pricing
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            One plan. Everything included. Cancel anytime.
          </p>
        </div>

        {/* Pro Plan card */}
        <div
          className="glass-card"
          style={{
            padding: "40px 36px",
            position: "relative",
            overflow: "hidden",
            textAlign: "left",
          }}
        >
          {/* Gradient background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--gradient-glow)",
              opacity: 0.06,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-1)", marginBottom: 4 }}>
                SHIPFORGE PRO
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    background: "var(--gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  $9.99
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: 15 }}>/month</span>
              </div>
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--success)",
              }}
            >
              7-day free trial
            </span>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              marginBottom: 32,
              display: "grid",
              gap: 12,
            }}
          >
            {[
              "Unlimited config generation",
              "All stack templates (Vite, Express, Docker, CI)",
              "Priority support",
              "Advanced templates",
              "Cancel anytime",
            ].map((feature) => (
              <li
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 15 }}
          >
            {user ? "Start Free Trial" : "Sign up & Start Free Trial"}
          </button>

          {subscribeError && (
            <div className="alert alert-error" style={{ marginTop: 12 }}>
              {subscribeError}
            </div>
          )}

          <p
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            No credit card required for trial · Cancel anytime
          </p>
        </div>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 32,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          ← Back to Home
        </Link>
      </div>

      <Footer />
    </>
  );
}
