import { Link } from "react-router-dom";
import ParallaxBackground from "../components/ParallaxBackground";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <ParallaxBackground />

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Ship production-ready stacks in seconds.
          </h1>

          <p className="mt-6 text-lg text-muted">
            Generate real-world configurations, boilerplates, Docker, CI, and environments —
            the way professional teams ship to production.
          </p>

          <div className="mt-8 flex gap-4">
            <Link to="/signup" className="bg-accent px-6 py-3 rounded font-medium hover:opacity-90">
              Start 14-Day Free Trial
            </Link>

            <Link to="/pricing" className="border border-white/20 px-6 py-3 rounded hover:bg-white/5">
              View pricing
            </Link>
          </div>

          <p className="mt-3 text-sm text-muted">
            $29/month after trial · Cancel anytime · No lock-in
          </p>
        </div>

        <div className="bg-panel rounded-xl p-6 border border-white/10">
          <p className="text-sm text-muted mb-2">Preview</p>
          <div className="h-64 bg-black/40 rounded flex items-center justify-center text-muted">
            Generator Dashboard (Live Soon)
          </div>
        </div>
      </div>
    </div>
  );
}
