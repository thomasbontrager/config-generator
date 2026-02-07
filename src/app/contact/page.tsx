'use client'

import { useState } from "react"
import Link from "next/link"

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      if (response.ok) {
        setStatus("✅ Message sent successfully! We&apos;ll get back to you soon.")
        setName("")
        setEmail("")
        setMessage("")
      } else {
        setStatus("❌ Failed to send message. Please try again.")
      }
    } catch {
      setStatus("❌ An error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">⚡ ShipForge</Link>
        <div className="space-x-6">
          <Link href="/pricing" className="text-gray-300 hover:text-white transition">
            💰 Pricing
          </Link>
          <Link href="/contact" className="text-white">
            📧 Contact
          </Link>
          <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-white">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-400">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {status && (
                <div className={`p-4 rounded-lg text-center ${
                  status.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {status}
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400">support@shipforge.dev</p>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2">Chat</h3>
              <p className="text-gray-400">Available Mon-Fri 9am-5pm EST</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-slate-700 text-center text-gray-400">
        <p>© 2026 ShipForge. Built with Next.js 14</p>
      </footer>
    </div>
  )
}
