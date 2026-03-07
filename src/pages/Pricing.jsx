import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Unlimited stack generation",
  "Vite + React template",
  "Express API template",
  "Docker configs",
  "CI/CD pipelines",
  "Prisma + PostgreSQL setup",
  "JWT auth boilerplate",
  "Rate limiting middleware",
  "Environment validation",
  "Priority updates",
];

export default function Pricing() {
  const { user } = useAuth();
  const isActive = user?.subscription === "ACTIVE" || user?.subscription === "TRIAL";

  return (
    <>
      <div className="grid-bg" />
      <Navbar />

      <section style={{ padding: "80px 24px", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 100,
            border: "1px solid rgba(99,102,241,0.35)",
            background: "rgba(99,102,241,0.08)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent-1)",
            marginBottom: 24,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Simple pricing
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          One plan.{" "}
          <span className="gradient-text">Everything included.</span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: 440,
            margin: "0 auto 60px",
          }}
        >
          Stop cobbling together boilerplate. Ship faster with Shipforge Pro.
        </p>

        {/* Pricing card */}
        <div
          className="glass-card"
          style={{
            padding: 40,
            maxWidth: 440,
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow accent */}
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              padding: "4px 12px",
              borderRadius: 100,
              background: "var(--gradient)",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Shipforge Pro
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.03em" }}>$29</span>
            <span style={{ color: "var(--text-secondary)", fontSize: 16 }}>/month</span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>
            14-day free trial included. Cancel anytime.
          </p>

          <ul
            style={{
              listStyle: "none",
              textAlign: "left",
              display: "grid",
              gap: 10,
              marginBottom: 32,
            }}
          >
            {FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "center" }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 11,
                    color: "var(--success)",
                  }}
                >
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          {isActive ? (
            <div className="alert alert-success" style={{ textAlign: "center" }}>
              ✓ You&apos;re already on Pro — {user.subscription}
            </div>
          ) : (
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Start Free Trial
            </Link>
          )}

          <p style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
            No credit card required for trial · Billed monthly
          </p>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 72, textAlign: "left", maxWidth: 480, margin: "72px auto 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
            Common questions
          </h2>
          {[
            {
              q: "What is included in the trial?",
              a: "Full access to all Pro features for 14 days. No credit card needed.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel with one click. No questions asked.",
            },
            {
              q: "What stacks are available?",
              a: "Vite + React and Express API are live. Next.js, FastAPI, Docker, and CI/CD are coming soon.",
            },
            {
              q: "Can I use the generated code commercially?",
              a: "Absolutely. The generated code is yours to use in any project.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "18px 0",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{q}</p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
          color: "var(--text-muted)",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 40,
        }}
      >
        <span>© {new Date().getFullYear()} Shipforge. All rights reserved.</span>
        <Link to="/" style={{ color: "var(--text-muted)" }}>← Back to Home</Link>
      </footer>
    </>
  );
}
