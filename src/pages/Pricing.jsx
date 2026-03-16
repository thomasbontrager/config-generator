import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { startSubscription } from "../api/billing";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscribeError, setSubscribeError] = useState("");

  async function handleSubscribe() {
    if (!user) {
      navigate("/signup");
      return;
    }
    // Clear any previous error before starting a new subscription attempt
    setSubscribeError("");

    const result = await startSubscription();

    // If startSubscription is refactored to return an error instead of alerting,
    // surface that error inline on the Pricing page.
    if (result) {
      if (typeof result === "string") {
        setSubscribeError(result);
      } else if (result && typeof result === "object") {
        const message =
          result.error ||
          result.message ||
          "Failed to start subscription. Please try again.";
        setSubscribeError(message);
      }
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
          padding: "80px 24px",
          textAlign: "center",
          animation: "fadeInUp 0.6s ease both",
        }}
      >
        <span className="hero-badge">💰 Plans &amp; Pricing</span>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 900,
            marginBottom: 14,
            letterSpacing: "-0.03em",
          }}
        >
          Simple,{" "}
          <span className="gradient-text">transparent</span> pricing
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 52 }}>
          One plan. Everything included. No surprises.
        </p>

        <div
          className="glass-card pricing-cta-card"
          style={{ padding: "44px 40px", position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--gradient-glow)",
              opacity: 0.06,
              pointerEvents: "none",
            }}
          />
          <div className="pricing-cta-badge">Most Popular</div>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Pro Plan
          </h2>
          <div className="pricing-cta-price">
            <span className="pricing-cta-amount">$9.99</span>
            <span className="pricing-cta-period">/month</span>
          </div>
          <p className="pricing-cta-desc" style={{ marginTop: 8, marginBottom: 28 }}>
            Everything you need to ship faster, forever.
          </p>
          <ul className="pricing-cta-features">
            {[
              "Unlimited config generation",
              "All stacks: Vite, Express, Next.js &amp; more",
              "Priority support",
              "Advanced templates",
              "14-day free trial",
              "Cancel anytime",
            ].map((f) => {
              const featureText = f.replace(/&amp;/g, "&");
              return (
                <li key={f} className="pricing-cta-feature">
                  <span className="pricing-cta-check">✓</span>
                  <span>{featureText}</span>
                </li>
              );
            })}
          </ul>
          <button
            className="btn btn-primary btn-lg pricing-cta-btn generator-btn"
            onClick={handleSubscribe}
          >
            Start Free Trial →
          </button>
          {subscribeError && (
            <p style={{ color: "var(--error, #f87171)", marginTop: 12, fontSize: 14 }}>
              {subscribeError}
            </p>
          )}
          <p className="pricing-cta-note">No credit card required · Cancel anytime</p>
        </div>

        <div style={{ marginTop: 40 }}>
          <Link to="/" className="btn btn-ghost">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

