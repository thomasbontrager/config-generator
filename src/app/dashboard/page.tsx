'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">⚡ ShipForge</div>
          <div className="flex items-center space-x-4">
            <Link href="/generator" className="text-gray-300 hover:text-white transition">
              Generator
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session.user?.name || 'User'}!
          </h1>
          <p className="text-gray-400">Manage your configs and subscription</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-gray-400 text-sm mb-2">Subscription</div>
            <div className="text-2xl font-bold text-blue-400">Trial</div>
            <div className="text-xs text-gray-500 mt-1">14 days remaining</div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-gray-400 text-sm mb-2">Configs Generated</div>
            <div className="text-2xl font-bold text-white">0</div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-gray-400 text-sm mb-2">Templates Used</div>
            <div className="text-2xl font-bold text-white">0</div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="text-gray-400 text-sm mb-2">Account Status</div>
            <div className="text-2xl font-bold text-green-400">Active</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/generator"
              className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold text-white">Generate Config</div>
              <div className="text-sm text-blue-200 mt-1">Create a new project config</div>
            </Link>

            <Link
              href="/dashboard/configs"
              className="bg-slate-700 hover:bg-slate-600 p-6 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">📂</div>
              <div className="font-semibold text-white">View Configs</div>
              <div className="text-sm text-gray-300 mt-1">Browse your saved configs</div>
            </Link>

            <Link
              href="/dashboard/subscription"
              className="bg-slate-700 hover:bg-slate-600 p-6 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">💳</div>
              <div className="font-semibold text-white">Manage Subscription</div>
              <div className="text-sm text-gray-300 mt-1">Update billing and plan</div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="bg-slate-700 hover:bg-slate-600 p-6 rounded-lg transition text-center"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-semibold text-white">Settings</div>
              <div className="text-sm text-gray-300 mt-1">Manage your account</div>
            </Link>
          </div>
        </div>

        {/* Recent Configs */}
        <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Configs</h2>
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-4">📋</div>
            <p>No configs generated yet</p>
            <p className="text-sm mt-2">Start by creating your first config!</p>
          </div>
        </div>
      </main>
    </div>
  )
}
