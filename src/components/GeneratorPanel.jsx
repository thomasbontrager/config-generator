import { Link } from "react-router-dom";
import StackCard from "./StackCard";

const STACKS = [
  { id: "vite",    label: "Vite + React",  sublabel: "Lightning-fast SPA with HMR",      icon: "⚡", available: true },
  { id: "express", label: "Express API",   sublabel: "Node.js REST API with Prisma",      icon: "🚀", available: true },
  { id: "nextjs",  label: "Next.js",       sublabel: "Full-stack React framework",        icon: "▲",  available: false },
  { id: "fastapi", label: "FastAPI",       sublabel: "Python async API framework",        icon: "🐍", available: false },
  { id: "docker",  label: "Docker",        sublabel: "Containerized deployments",         icon: "🐳", available: false },
  { id: "cicd",    label: "CI/CD",         sublabel: "GitHub Actions pipelines",          icon: "⚙️", available: false },
];

export default function GeneratorPanel({ selected, onToggle, onGenerate, generating, isActive, user }) {
  const anySelected = Object.values(selected).some(Boolean);

  return (
    <section id="generator" className="generator-section">
      <div className="glass-card generator-panel">
        <div className="generator-panel__header">
          <h2 className="generator-panel__title">Configure Your Stack</h2>
          <p className="generator-panel__desc">
            Click cards to select the components you want in your project ZIP.
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

        <div className="stack-cards-grid">
          {STACKS.map((stack) => (
            <StackCard
              key={stack.id}
              stack={stack}
              selected={!!selected[stack.id]}
              onSelect={onToggle}
            />
          ))}
        </div>

        <div className="generator-panel__footer">
          <button
            className="btn btn-primary btn-lg generator-btn"
            onClick={onGenerate}
            disabled={!anySelected || generating}
          >
            {generating ? "Generating…" : "Generate Project ZIP"}
          </button>

          {!user && (
            <p className="generator-panel__signup-note">
              <Link to="/signup" style={{ color: "var(--accent-1)" }}>Sign up</Link> to download
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
