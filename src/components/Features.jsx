const FEATURES = [
  {
    icon: "⚡",
    title: "Instant stack setup",
    desc: "Download a fully configured, ready-to-run project in seconds — no manual wiring required.",
  },
  {
    icon: "🐳",
    title: "Docker ready",
    desc: "Dockerfile and docker-compose files pre-configured and production-optimized out of the box.",
  },
  {
    icon: "🔑",
    title: "Environment configs",
    desc: "Secure .env examples with JWT secrets, DB URLs, and validation scaffolding built in.",
  },
  {
    icon: "⚙️",
    title: "CI pipelines included",
    desc: "GitHub Actions workflows for lint, test, and deploy ship alongside your code from day one.",
  },
];

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-header">
        <h2 className="features-title">Why developers use Shipforge</h2>
        <p className="features-subtitle">
          Everything you need to go from idea to production, without the boilerplate tax.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card glass-card">
            <div className="feature-card__icon">{f.icon}</div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
