"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DemoAccountsCard } from "@/components/demo-accounts-card"
import { validateDemoAccount } from "@/lib/demo-accounts"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)

  const handleLogin = (loginEmail: string, loginPassword: string) => {
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (!loginEmail || !loginPassword) {
        setError("Please fill in all fields to continue.")
        setLoading(false)
        return
      }

      // Check if it's a demo account
      const demoAccount = validateDemoAccount(loginEmail, loginPassword)
      if (demoAccount) {
        console.log("Demo account login:", demoAccount.role)
        window.location.href = demoAccount.redirectTo
        return
      }

      // Regular validation
      if (!loginEmail.includes("@")) {
        setError("Please enter a valid email address.")
        setLoading(false)
        return
      }

      // For non-demo accounts, show error
      setError("Invalid credentials. Use a demo account or create a new account.")
      setLoading(false)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(email, password)
  }

  const handleSelectDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setShowDemoAccounts(false)
    // Auto-login after a brief delay
    setTimeout(() => {
      handleLogin(demoEmail, demoPassword)
    }, 300)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#F0F0F0]">Welcome back</h1>
          <p className="text-[#B0B0B8]">Sign in to access your trading dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#F0F0F0]">
                Password
              </label>
              <a href="/auth/forgot-password" className="text-sm text-[#641AE4] hover:text-[#9A24D2] transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2D2D3D]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1E1E2B] text-[#B0B0B8]">New to GemEx?</span>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <a
            href="/auth/signup"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
          >
            Create an account
          </a>
        </div>

        {/* Demo Accounts Toggle */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="text-sm text-[#641AE4] hover:text-[#9A24D2] transition-colors font-medium"
          >
            {showDemoAccounts ? "Hide demo accounts" : "🎭 Show demo accounts"}
          </motion.button>
        </div>

        {/* Demo Accounts Card */}
        {showDemoAccounts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DemoAccountsCard onSelectAccount={handleSelectDemoAccount} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
