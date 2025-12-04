"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { AuthHeader } from "@/components/auth-header"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (!email || !password) {
        setError("Please fill in all fields to continue.")
        setLoading(false)
      } else if (!email.includes("@")) {
        setError("Please enter a valid email address.")
        setLoading(false)
      } else {
        console.log("Login attempt:", { email, password })
        // In a real app, redirect to dashboard
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center p-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#641AE4]/10 via-transparent to-[#9A24D2]/10 blur-3xl" />

        <motion.div
          variants={formVariants}
          className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8"
        >
          <AuthHeader />

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Welcome Back</h2>
              <p className="text-[#B0B0B8] text-sm">Sign in to access your trading dashboard</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded font-medium"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>

            <div className="flex gap-2 text-sm text-[#B0B0B8] justify-center">
              <span>New to GemEx?</span>
              <a href="/auth/signup" className="text-[#C8F55A] hover:underline font-medium">
                Create Account
              </a>
            </div>

            <a href="/auth/forgot-password" className="block text-center text-sm text-[#641AE4] hover:underline">
              Forgot your password?
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
