'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

const CONFIG_TYPES = [
  { id: 'react', name: 'React', category: 'Frontend', icon: '⚛️' },
  { id: 'vue', name: 'Vue', category: 'Frontend', icon: '💚' },
  { id: 'express', name: 'Express', category: 'Backend', icon: '🚂' },
  { id: 'django', name: 'Django', category: 'Backend', icon: '🐍' },
  { id: 'docker', name: 'Docker', category: 'DevOps', icon: '🐳' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', icon: '☸️' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'CI/CD', icon: '🚀' },
]

export default function Generator() {
  const { data: session, status } = useSession()
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const toggleConfig = (id: string) => {
    setSelectedConfigs(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (selectedConfigs.length === 0) {
      setMessage("❌ Please select at least one configuration")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configTypes: selectedConfigs }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate configs")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `shipforge-configs-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setMessage("✅ Configs generated successfully!")
      
      // Track in analytics if GA is available
      if (typeof window !== 'undefined') {
        const gtag = (window as Window & typeof globalThis & { gtag?: (...args: unknown[]) => void }).gtag
        if (gtag) {
          gtag('event', 'generate_config', {
            config_types: selectedConfigs.join(', '),
            count: selectedConfigs.length
          })
        }
      }
    } catch {
      setMessage("❌ Failed to generate configs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">⚡ ShipForge</Link>
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/generator" className="text-white">
                  Generator
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">⚡ Config Generator</h1>
            <p className="text-xl text-gray-400">
              Select your stack and generate production-ready configurations
            </p>
          </div>

          {/* Frontend */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">FRONTEND</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {CONFIG_TYPES.filter(c => c.category === 'Frontend').map(config => (
                <button
                  key={config.id}
                  onClick={() => toggleConfig(config.id)}
                  className={`p-6 rounded-xl border-2 transition ${
                    selectedConfigs.includes(config.id)
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-slate-800 border-slate-700 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{config.icon}</div>
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white">{config.name}</div>
                      <div className="text-sm text-gray-400">{config.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">BACKEND</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {CONFIG_TYPES.filter(c => c.category === 'Backend').map(config => (
                <button
                  key={config.id}
                  onClick={() => toggleConfig(config.id)}
                  className={`p-6 rounded-xl border-2 transition ${
                    selectedConfigs.includes(config.id)
                      ? 'bg-green-600 border-green-500'
                      : 'bg-slate-800 border-slate-700 hover:border-green-500'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{config.icon}</div>
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white">{config.name}</div>
                      <div className="text-sm text-gray-400">{config.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DevOps & CI/CD */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">DEVOPS & CI/CD</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {CONFIG_TYPES.filter(c => c.category === 'DevOps' || c.category === 'CI/CD').map(config => (
                <button
                  key={config.id}
                  onClick={() => toggleConfig(config.id)}
                  className={`p-6 rounded-xl border-2 transition ${
                    selectedConfigs.includes(config.id)
                      ? 'bg-purple-600 border-purple-500'
                      : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{config.icon}</div>
                    <div className="text-lg font-semibold text-white">{config.name}</div>
                    <div className="text-xs text-gray-400">{config.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <div className="mb-4">
              <span className="text-gray-400">Selected: </span>
              <span className="text-white font-semibold">
                {selectedConfigs.length} config{selectedConfigs.length !== 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selectedConfigs.length === 0}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-white text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate ZIP"}
            </button>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                {message}
              </div>
            )}
          </div>

          {session && (
            <div className="mt-6 text-center text-gray-400 text-sm">
              💾 Your generated configs are automatically saved to your{" "}
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
                dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
