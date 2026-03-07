import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <span>⚡</span> Production-ready developer stacks
      </div>

      <h1 className="hero-title">
        <span className="gradient-text">Shipforge</span>
      </h1>

      <p className="hero-subtitle">Generate production-ready stacks instantly</p>

      <p className="hero-subtext">Stop rebuilding configs. Ship faster.</p>

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
  );
}
