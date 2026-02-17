export default function Pricing() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full rounded-xl p-8 border border-white/10" style={{ backgroundColor: '#121826' }}>
        <h2 className="text-3xl font-bold text-center">Pro — $29 / month</h2>

        <ul className="mt-6 space-y-3" style={{ color: '#9ca3af' }}>
          <li>✔ Unlimited generators</li>
          <li>✔ All stacks &amp; templates</li>
          <li>✔ Docker &amp; CI included</li>
          <li>✔ Continuous updates</li>
          <li>✔ 14-day free trial</li>
        </ul>

        <button className="mt-8 w-full py-3 rounded font-medium" style={{ backgroundColor: '#3b82f6' }}>
          Start Free Trial
        </button>
      </div>
    </div>
  );
}
