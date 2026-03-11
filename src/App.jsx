import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { generateZip } from "./generateZip";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import Pricing from "./pages/Pricing";
import ShipforgeCursor from "./components/ShipforgeCursor";
import ButtonStars from "./components/ButtonStars";
import "./App.css";

// ── Stack definitions ─────────────────────────────────────────────────────────
const STACKS = [
  { id: "vite",           label: "Vite + React",         sublabel: "Lightning-fast SPA with HMR",        icon: "⚡", available: true  },
  { id: "express",        label: "Express API",           sublabel: "Node.js REST API + Prisma + PostgreSQL", icon: "🚀", available: true  },
  { id: "nextjs",         label: "Next.js",               sublabel: "Full-stack React framework",         icon: "▲",  available: false },
  { id: "fastapi",        label: "FastAPI",               sublabel: "Python async API framework",         icon: "🐍", available: false },
  { id: "docker",         label: "Docker",                sublabel: "Containerized deployments",          icon: "🐳", available: false },
  { id: "githubRulesets", label: "GitHub Rulesets",       sublabel: "Branch protection policies",         icon: "⚙️", available: true  },
];

const FEATURES = [
  { icon: "⚡", title: "Instant stack setup",    desc: "Download a fully configured, ready-to-run project in seconds — no manual wiring required." },
  { icon: "🐳", title: "Docker ready",           desc: "Dockerfile and docker-compose files pre-configured and production-optimised out of the box." },
  { icon: "🔑", title: "Environment configs",    desc: "Secure .env examples with JWT secrets, DB URLs, and validation scaffolding built in." },
  { icon: "⚙️", title: "CI/CD pipelines",        desc: "GitHub Actions workflows for lint, test, and deploy ship alongside your code from day one." },
];

// ── StackCard ─────────────────────────────────────────────────────────────────
function StackCard({ stack, selected, onSelect }) {
  const cls = [
    "stack-card",
    selected ? "stack-card--selected" : "",
    !stack.available ? "stack-card--soon" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cls}
      onClick={() => stack.available && onSelect(stack.id)}
      role="checkbox"
      aria-checked={selected}
      tabIndex={stack.available ? 0 : -1}
      onKeyDown={e => {
        if (e.key === " ") {
          e.preventDefault();
          if (stack.available) {
            onSelect(stack.id);
          }
        }
      }}
    >
      <div className="stack-card__icon">{stack.icon}</div>
      <div className="stack-card__content">
        <div className="stack-card__label">
          {stack.label}
          {!stack.available && <span className="stack-card__soon">SOON</span>}
        </div>
        <div className="stack-card__sublabel">{stack.sublabel}</div>
      </div>
      {selected && <span className="stack-card__check">✓</span>}
    </div>
  );
}

// ── Home page ─────────────────────────────────────────────────────────────────
function Home() {
  const [selected, setSelected] = useState({
    vite: false, express: false, nextjs: false, githubRulesets: false,
  });
  const [generating, setGenerating] = useState(false);
  const cursorGlowRef = useRef(null);

  // Radial spotlight that tracks the mouse
  useEffect(() => {
    function onMove(e) {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.background =
          `radial-gradient(650px at ${e.clientX}px ${e.clientY}px, rgba(99,102,241,0.09) 0%, transparent 70%)`;
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function toggleStack(id) {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }

  async function handleGenerate() {
    const anySelected = Object.values(selected).some(Boolean);
    if (!anySelected || generating) return;
    setGenerating(true);
    try {
      await generateZip(selected);
    } catch (error) {
      // Optional: log or surface the error
      console.error("Failed to generate ZIP:", error);
    } finally {
      setGenerating(false);
    }
  }

  const anySelected = Object.values(selected).some(Boolean);

  return (
    <>
      <div className="grid-bg" />
      <div className="cursor-glow" ref={cursorGlowRef} />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">⚡ Shipforge</Link>
        <div className="navbar-links">
          <Link to="/pricing" className="navbar-link">Pricing</Link>
          <a
            href="https://github.com/thomasbontrager/config-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link"
          >
            GitHub
          </a>
          <Link to="/pricing" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>🚀</span> Production-ready developer stacks
        </div>
        <h1 className="hero-title">
          <span className="gradient-text">Shipforge</span>
        </h1>
        <p className="hero-subtitle">Generate production-ready stacks instantly</p>
        <p className="hero-subtext">Stop rebuilding configs from scratch. Ship faster with zero boilerplate debt.</p>
        <div className="hero-ctas">
          <a href="#generator" className="btn btn-primary btn-lg">
            Generate Stack →
          </a>
          <Link to="/pricing" className="btn btn-secondary btn-lg">
            View Pricing
          </Link>
        </div>
        <p className="hero-note">14-day free trial · No credit card required</p>
      </section>

      {/* ── Generator ── */}
      <section id="generator" className="generator-section">
        <div className="glass-card generator-panel">
          <div className="generator-panel__header">
            <h2 className="generator-panel__title">Configure Your Stack</h2>
            <p className="generator-panel__desc">
              Click the cards below to select the components you want in your project ZIP.
            </p>
          </div>

          <div className="stack-cards-grid">
            {STACKS.map(stack => (
              <StackCard
                key={stack.id}
                stack={stack}
                selected={!!selected[stack.id]}
                onSelect={toggleStack}
              />
            ))}
          </div>

          <div className="generator-panel__footer">
            <button
              className="btn btn-primary btn-lg generator-btn"
              onClick={handleGenerate}
              disabled={!anySelected || generating}
            >
              {generating ? "⏳ Generating…" : "⬇ Generate Project ZIP"}
            </button>
            {!anySelected && (
              <p className="generator-panel__signup-note">Select at least one stack above</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="features-title">Why developers use Shipforge</h2>
          <p className="features-subtitle">
            Everything you need to go from idea to production, without the boilerplate tax.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card glass-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__brand gradient-text">⚡ Shipforge</span>
          <span className="site-footer__copy">
            © {new Date().getFullYear()} Shipforge. All rights reserved.
          </span>
          <nav className="site-footer__links">
            <Link to="/pricing" className="site-footer__link">Pricing</Link>
            <a
              href="https://github.com/thomasbontrager/config-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__link"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      {/* Global effects rendered outside routes so they span all pages */}
      <ShipforgeCursor />
      <ButtonStars />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
      </Routes>
    </BrowserRouter>
  );
}
