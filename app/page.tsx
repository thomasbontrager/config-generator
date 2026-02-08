import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] to-[#16213e]">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">⚡ ShipForge</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#4a9eff] to-[#2a7dd8] bg-clip-text text-transparent">
          Config & Boilerplate Generator
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          Generate production-ready configurations for your favorite stacks in seconds
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Free Trial
          </Button>
        </Link>
        <p className="text-sm text-gray-400 mt-4">14-day free trial • No credit card required</p>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#4a9eff]">
          Generate Configs for Popular Stacks
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'React + TypeScript', icon: '⚛️', desc: 'ESLint, Prettier, Vite ready' },
            { name: 'Vue 3', icon: '💚', desc: 'Modern Vite setup' },
            { name: 'Express.js', icon: '🚀', desc: 'Async/await patterns' },
            { name: 'Django', icon: '🐍', desc: 'Requirements & manage.py' },
            { name: 'Docker', icon: '🐳', desc: 'Dockerfile + Compose' },
            { name: 'Kubernetes', icon: '☸️', desc: 'Deployment manifests' },
            { name: 'GitHub Actions', icon: '⚙️', desc: 'CI/CD workflows' },
            { name: 'Next.js', icon: '▲', desc: 'App router configuration' },
            { name: 'Tailwind CSS', icon: '🎨', desc: 'Full configuration' },
          ].map((feature) => (
            <div
              key={feature.name}
              className="bg-white/5 border border-[#4a9eff]/20 rounded-lg p-6 hover:bg-[#4a9eff]/10 hover:border-[#4a9eff]/50 transition-all"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#4a9eff]">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-[#4a9eff]/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
            <div className="text-4xl font-bold mb-4">$0</div>
            <p className="text-gray-400 mb-6">14 days</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 10 config generations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> All templates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> ZIP downloads
              </li>
            </ul>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full">
                Start Trial
              </Button>
            </Link>
          </div>

          <div className="bg-[#4a9eff]/10 border-2 border-[#4a9eff] rounded-lg p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4a9eff] text-white px-4 py-1 rounded-full text-sm font-semibold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-1">$29</div>
            <p className="text-gray-400 mb-6">per month</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Unlimited generations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> All templates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Config history
              </li>
            </ul>
            <Link href="/auth/signup">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ShipForge</h3>
              <p className="text-gray-400 text-sm">
                Generate production-ready configurations for your projects in seconds.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-[#4a9eff]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-[#4a9eff]">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/legacy" className="text-gray-400 hover:text-[#4a9eff]">
                    Legacy Version
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <form id="paypal-button-container" className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Support via PayPal:</div>
                <form action="https://www.paypal.com/donate" method="post" target="_blank">
                  <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL" />
                  <input type="hidden" name="no_recurring" value="0" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <Button type="submit" variant="outline" size="sm">
                    Donate with PayPal
                  </Button>
                </form>
              </form>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            © 2026 ShipForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
