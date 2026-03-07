import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { generateZip } from "../generateZip";
import { useState } from "react";
import UpgradeModal from "../components/UpgradeModal";

function SubscriptionBadge({ status }) {
  const map = {
    ACTIVE: "badge-active",
    TRIAL: "badge-trial",
    FREE: "badge-free",
    CANCELLED: "badge-cancelled",
  };
  return <span className={`badge ${map[status] || "badge-free"}`}>{status || "FREE"}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState({ vite: true, express: true });
  const [generating, setGenerating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isActive = user?.subscription === "ACTIVE" || user?.subscription === "TRIAL";

  function toggleStack(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleGenerate() {
    if (!isActive) {
      setShowUpgrade(true);
      return;
    }
    setGenerating(true);
    try {
      await generateZip({ vite: selected.vite, express: selected.express });
    } finally {
      setGenerating(false);
    }
  }

  const stacks = [
    { id: "vite", label: "Vite + React", desc: "SPA with HMR" },
    { id: "express", label: "Express API", desc: "Node.js REST API" },
  ];

  return (
    <>
      <div className="grid-bg" />
      <Navbar />

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {user?.email}
            </span>
            <SubscriptionBadge status={user?.subscription} />
          </div>
        </div>

        {/* Upgrade banner */}
        {!isActive && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              padding: "16px 20px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: 32,
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                Upgrade to Shipforge Pro
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Generate unlimited stacks with all templates included.
              </p>
            </div>
            <Link to="/pricing" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Start Free Trial
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {/* Stats */}
          {[
            { label: "Plan", value: user?.subscription || "FREE" },
            { label: "Role", value: user?.role || "USER" },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                {label}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Generator */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Generate Project ZIP
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
            Select stacks and download your project template.
          </p>

          <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
            {stacks.map((s) => {
              const isChecked = !!selected[s.id];
              return (
                <label
                  key={s.id}
                  className={`stack-checkbox ${isChecked ? "checked" : ""} ${!isActive ? "disabled" : ""}`}
                  onClick={() => isActive && toggleStack(s.id)}
                >
                  <input type="checkbox" checked={isChecked} onChange={() => {}} />
                  <span className="checkbox-mark" />
                  <div>
                    <div className="stack-label">{s.label}</div>
                    <div className="stack-sublabel">{s.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!Object.values(selected).some(Boolean) || generating}
            style={{ minWidth: 200 }}
          >
            {generating ? "Generating…" : "Generate Project ZIP"}
          </button>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
