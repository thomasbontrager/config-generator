import { Link } from "react-router-dom";

const PRO_FEATURES = [
  "Unlimited stack generations",
  "Docker & docker-compose files",
  "GitHub Actions CI/CD pipelines",
  "Prisma ORM with schema scaffold",
  "Environment validation (Zod)",
  "Priority support",
];

export default function PricingCTA() {
  return (
    <section className="pricing-cta-section">
      <div className="pricing-cta-card glass-card">
        <div className="pricing-cta-badge">Most Popular</div>
        <h2 className="pricing-cta-title">Shipforge Pro</h2>
        <div className="pricing-cta-price">
          <span className="pricing-cta-amount">$29</span>
          <span className="pricing-cta-period">/month</span>
        </div>
        <p className="pricing-cta-desc">
          Everything you need to ship production-ready projects faster.
        </p>

        <ul className="pricing-cta-features">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="pricing-cta-feature">
              <span className="pricing-cta-check">✓</span> {f}
            </li>
          ))}
        </ul>

        <Link to="/pricing" className="btn btn-primary btn-lg pricing-cta-btn">
          Start 14-Day Free Trial
        </Link>
        <p className="pricing-cta-note">No credit card required</p>
      </div>
    </section>
  );
}
