import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">⚡ ShipForge</div>
        <div className="space-x-6">
          <Link href="/pricing" className="hover:text-blue-400 transition">
            💰 Pricing
          </Link>
          <Link href="/contact" className="hover:text-blue-400 transition">
            📧 Contact
          </Link>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Ship Faster with ShipForge
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Generate production-ready configs and boilerplates for React, Vue, Express, Django, Docker, Kubernetes, and GitHub Actions in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mb-20">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
          >
            Start Free Trial
          </Link>
          <Link
            href="/generator"
            className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
          >
            Try Generator
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Fast Setup</h3>
            <p className="text-gray-400">Generate complete project configs in seconds, not hours</p>
          </div>
          
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-3">Production Ready</h3>
            <p className="text-gray-400">Battle-tested configurations following best practices</p>
          </div>
          
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-3">Save & Version</h3>
            <p className="text-gray-400">Keep track of all your generated configs with version history</p>
          </div>
        </div>

        {/* Supported Technologies */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Supported Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Vue', 'Express', 'Django', 'Docker', 'Kubernetes', 'GitHub Actions'].map((tech) => (
              <span
                key={tech}
                className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-700 hover:border-blue-500 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-slate-700 text-center text-gray-400">
        <p>© 2026 ShipForge. Built with Next.js 14</p>
      </footer>
    </div>
  );
}
