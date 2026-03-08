import { Link } from "react-router-dom";

export default function UpgradeModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Upgrade to Shipforge Pro
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            You need an active subscription to generate and download project stacks.
          </p>
        </div>

        <div
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Shipforge Pro</span>
            <span style={{ fontWeight: 800, fontSize: 22 }}>
              $29
              <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-secondary)" }}>
                /month
              </span>
            </span>
          </div>
          <ul
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              listStyle: "none",
              display: "grid",
              gap: 6,
            }}
          >
            {[
              "Unlimited stack generation",
              "All templates",
              "Docker configs",
              "CI pipelines",
              "Priority updates",
            ].map((f) => (
              <li key={f} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--success)" }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <Link
            to="/pricing"
            className="btn btn-primary"
            style={{ justifyContent: "center", padding: "12px 0" }}
            onClick={onClose}
          >
            Start 14-Day Free Trial
          </Link>
          <button className="btn btn-ghost" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
