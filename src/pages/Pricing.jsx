export default function Pricing() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-panel border border-white/10 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center">Pro — $29 / month</h2>

        <ul className="mt-6 space-y-3 text-muted">
          <li>✔ Unlimited generators</li>
          <li>✔ All stacks &amp; templates</li>
          <li>✔ Docker &amp; CI included</li>
          <li>✔ Continuous updates</li>
          <li>✔ 14-day free trial</li>
        </ul>

        <button className="mt-8 w-full bg-accent py-3 rounded font-medium">
          Start Free Trial
        </button>
      </div>
    </div>
  );
}
