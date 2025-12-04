"use client"

import { motion } from "framer-motion"
import { DemoAccountsCard } from "@/components/demo-accounts-card"
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts"
import Link from "next/link"
import Image from "next/image"

export default function DemoPage() {
  const handleSelectAccount = (email: string, password: string) => {
    // Store credentials in sessionStorage for auto-fill
    sessionStorage.setItem("demo_email", email)
    sessionStorage.setItem("demo_password", password)
    // Redirect to login
    window.location.href = "/auth/login"
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#641AE4]/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#9A24D2]/20 via-transparent to-transparent blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 relative">
              <Image src="/images/gemex-20logo.png" alt="GemEx" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-[#F0F0F0]">GemEx</span>
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            {/* Hero Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-block text-6xl mb-6"
              >
                🎭
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#F0F0F0] mb-4">
                Demo Accounts
              </h1>
              <p className="text-lg text-[#B0B0B8] max-w-2xl mx-auto">
                Test GemEx with pre-configured accounts for each user role. No signup required.
              </p>
            </div>

            {/* Demo Accounts Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {Object.entries(DEMO_ACCOUNTS).map(([key, account]) => {
                const icons = {
                  client: "👤",
                  dealer: "💼",
                  admin: "⚙️",
                }
                const colors = {
                  client: "from-[#641AE4] to-[#9A24D2]",
                  dealer: "from-[#9A24D2] to-[#641AE4]",
                  admin: "from-[#641AE4] to-[#C8F55A]",
                }
                const descriptions = {
                  client: "Trade crypto and fiat with real-time quotes",
                  dealer: "Process quotes and approve trades",
                  admin: "Manage users and system settings",
                }

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (Object.keys(DEMO_ACCOUNTS).indexOf(key)) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-xl p-6 cursor-pointer"
                    onClick={() => handleSelectAccount(account.email, account.password)}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors[key as keyof typeof colors]} flex items-center justify-center text-3xl mb-4`}>
                      {icons[key as keyof typeof icons]}
                    </div>
                    <h3 className="text-xl font-bold text-[#F0F0F0] mb-2 capitalize">{account.role}</h3>
                    <p className="text-sm text-[#B0B0B8] mb-4">{descriptions[key as keyof typeof descriptions]}</p>
                    <div className="space-y-2 mb-4">
                      <div className="bg-[#2D2D3D]/50 rounded px-3 py-2">
                        <p className="text-xs text-[#B0B0B8]">Email</p>
                        <p className="text-sm text-[#F0F0F0] font-mono truncate">{account.email}</p>
                      </div>
                      <div className="bg-[#2D2D3D]/50 rounded px-3 py-2">
                        <p className="text-xs text-[#B0B0B8]">Password</p>
                        <p className="text-sm text-[#F0F0F0] font-mono">{account.password}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
                    >
                      Login as {account.role}
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">✨ Features</h3>
                <ul className="space-y-2 text-sm text-[#B0B0B8]">
                  <li>• Full access to role-specific dashboards</li>
                  <li>• Pre-populated demo data</li>
                  <li>• All features unlocked</li>
                  <li>• No registration required</li>
                </ul>
              </div>

              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F0F0F0] mb-3">🔒 Note</h3>
                <p className="text-sm text-[#B0B0B8] mb-2">
                  Demo accounts are for testing purposes only. Data is not persisted and will reset periodically.
                </p>
                <p className="text-sm text-[#B0B0B8]">
                  For production use, please create a real account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
              >
                Go to Login
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
              >
                Create Real Account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-[#B0B0B8]">
          <p>© 2024 GemEx. Demo environment for testing purposes.</p>
        </footer>
      </div>
    </div>
  )
}
