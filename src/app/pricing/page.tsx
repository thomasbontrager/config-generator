import Link from "next/link"

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">⚡ ShipForge</Link>
        <div className="space-x-6">
          <Link href="/pricing" className="text-white">
            💰 Pricing
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-white transition">
            📧 Contact
          </Link>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-white">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300">Start with a 14-day free trial. No credit card required.</p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Trial */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Free Trial</h3>
              <div className="text-5xl font-bold text-blue-400 mb-4">$0</div>
              <p className="text-gray-400">14 days • No credit card</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Unlimited config generation
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                All templates included
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Save configs to dashboard
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                ZIP download
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Email support
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-lg font-semibold transition"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl border-2 border-blue-500 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="text-5xl font-bold text-white mb-2">$29</div>
              <p className="text-blue-200">per month • Billed monthly</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                Everything in Free Trial
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                Version history tracking
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                GitHub template integration
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                Custom templates
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                Priority support
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-300 mr-3">✓</span>
                Team collaboration
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full text-center bg-white hover:bg-gray-100 text-blue-600 py-4 rounded-lg font-semibold transition"
            >
              Get Started Now
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">Yes, we offer a 30-day money-back guarantee if you&apos;re not satisfied with ShipForge.</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Is there a team plan?</h3>
              <p className="text-gray-400">Team collaboration features are included in the Pro plan. Contact us for enterprise pricing.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to ship faster?</h2>
          <p className="text-xl text-gray-400 mb-8">Start your 14-day free trial today</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg text-white transition transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-slate-700 text-center text-gray-400">
        <p>© 2026 ShipForge. Built with Next.js 14</p>
      </footer>
    </div>
  )
}
