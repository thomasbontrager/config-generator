import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateZip } from "../generateZip";
import Navbar from "../components/Navbar";
import UpgradeModal from "../components/UpgradeModal";

const FRONTEND_STACKS = [
  { id: "vite", label: "Vite + React", sublabel: "Lightning-fast SPA with HMR", available: true },
  { id: "nextjs", label: "Next.js", sublabel: "Full-stack React framework", available: false },
];

const BACKEND_STACKS = [
  { id: "express", label: "Express API", sublabel: "Node.js REST API with Prisma", available: true },
  { id: "fastapi", label: "FastAPI", sublabel: "Python async API framework", available: false },
];

const INFRA_STACKS = [
  { id: "docker", label: "Docker", sublabel: "Containerized deployments", available: false },
  { id: "cicd", label: "CI/CD", sublabel: "GitHub Actions pipelines", available: false },
];

function StackOption({ stack, selected, onToggle }) {
  const cls = [
    "stack-checkbox",
    selected ? "checked" : "",
    !stack.available ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={cls} onClick={() => stack.available && onToggle(stack.id)}>
      <input type="checkbox" checked={selected} onChange={() => {}} />
      <span className="checkbox-mark" />
      <div>
        <div className="stack-label">
          {stack.label}
          {!stack.available && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.07)",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              SOON
            </span>
          )}
        </div>
        <div className="stack-sublabel">{stack.sublabel}</div>
      </div>
    </label>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [selected, setSelected] = useState({ vite: true, express: true });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isActive =
    user?.subscription === "ACTIVE" || user?.subscription === "TRIAL";

  function toggleStack(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleGenerate() {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    if (!isActive) {
      setShowUpgrade(true);
      return;
    }
    const anySelected = Object.values(selected).some(Boolean);
    if (!anySelected) return;

    setGenerating(true);
    try {
      await generateZip({ vite: selected.vite, express: selected.express });
    } finally {
      setGenerating(false);
    }
  }

  const anySelected = Object.values(selected).some(Boolean);

  return (
    <>
      <div className="grid-bg" />
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
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
            marginBottom: 28,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          ⚡ Production-ready developer stacks
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Generate{" "}
          <span className="gradient-text">production-ready</span>
          <br />
          stacks instantly
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--text-secondary)",
            marginBottom: 40,
            maxWidth: 480,
            margin: "0 auto 40px",
          }}
        >
          No setup hell. Just ship.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#generator"
            className="btn btn-primary btn-lg"
            style={{ minWidth: 180 }}
          >
            Generate Stack →
          </a>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            View Pricing
          </Link>
        </div>

        <p
          style={{
            marginTop: 20,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          14-day free trial · No credit card required
        </p>
      </section>

      {/* ── Generator Panel ── */}
      <section id="generator" style={{ padding: "0 24px 100px", maxWidth: 780, margin: "0 auto" }}>
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              Configure Your Stack
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Select the components you want to include in your project ZIP.
            </p>
          </div>

          {!isActive && user && (
            <div className="alert alert-warning" style={{ marginBottom: 24 }}>
              Your plan is <strong>{user.subscription || "FREE"}</strong>.{" "}
              <Link to="/pricing" style={{ color: "var(--warning)", textDecoration: "underline" }}>
                Upgrade to Pro
              </Link>{" "}
              to generate stacks.
            </div>
          )}

          <div style={{ display: "grid", gap: 24 }}>
            {/* Frontend */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Frontend
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {FRONTEND_STACKS.map((s) => (
                  <StackOption
                    key={s.id}
                    stack={s}
                    selected={!!selected[s.id]}
                    onToggle={toggleStack}
                  />
                ))}
              </div>
            </div>

            {/* Backend */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Backend
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {BACKEND_STACKS.map((s) => (
                  <StackOption
                    key={s.id}
                    stack={s}
                    selected={!!selected[s.id]}
                    onToggle={toggleStack}
                  />
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Infrastructure
              </p>
              <div style={{ display: "grid", gap: 8 }}>
                {INFRA_STACKS.map((s) => (
                  <StackOption
                    key={s.id}
                    stack={s}
                    selected={!!selected[s.id]}
                    onToggle={toggleStack}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={!anySelected || generating}
              style={{ minWidth: 220 }}
            >
              {generating ? "Generating…" : "Generate Project ZIP"}
            </button>

            {!user && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                <Link to="/signup" style={{ color: "var(--accent-1)" }}>
                  Sign up
                </Link>{" "}
                to download
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          padding: "60px 24px",
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 32,
          textAlign: "center",
        }}
      >
        {[
          { icon: "📦", title: "Instant ZIP", desc: "Download a ready-to-run project in seconds" },
          { icon: "🔒", title: "Secure Templates", desc: "JWT auth, rate limiting, env validation baked in" },
          { icon: "🐳", title: "Docker Ready", desc: "Dockerfile & compose files included (Pro)" },
          { icon: "⚙️", title: "CI/CD Pipelines", desc: "GitHub Actions workflows pre-configured (Pro)" },
        ].map((f) => (
          <div key={f.title}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
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
        }}
      >
        <span>© {new Date().getFullYear()} Shipforge. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/pricing" style={{ color: "var(--text-muted)" }}>Pricing</Link>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>Login</Link>
        </div>
      </footer>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
