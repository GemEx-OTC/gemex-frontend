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

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields to create your account.")
      } else if (!email.includes("@")) {
        setError("Please enter a valid email address.")
      } else if (password !== confirmPassword) {
        setError("Passwords do not match. Please try again.")
      } else if (password.length < 8) {
        setError("Password must be at least 8 characters long.")
      } else {
        console.log("Signup attempt:", { fullName, email, password })
        // In a real app, redirect to KYC onboarding
        window.location.href = "/auth/onboard/kyc-start"
        setLoading(false)
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center p-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-[#641AE4]/10 via-transparent to-[#9A24D2]/10 blur-3xl" />

        <motion.div
          variants={formVariants}
          className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8"
        >
          <AuthHeader />

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Get Started with GemEx</h2>
              <p className="text-[#B0B0B8] text-sm">Create your account to begin trading</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
              />
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
              <p className="text-[#B0B0B8] text-xs mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>

            <div className="p-3 bg-[#C8F55A]/10 border border-[#C8F55A]/20 rounded-lg">
              <p className="text-[#C8F55A] text-xs font-medium">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <div className="flex gap-2 text-sm text-[#B0B0B8] justify-center">
              <span>Already have an account?</span>
              <a href="/auth/login" className="text-[#C8F55A] hover:underline font-medium">
                Sign In
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
