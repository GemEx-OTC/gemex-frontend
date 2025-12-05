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
        setLoading(false)
      } else if (!email.includes("@")) {
        setError("Please enter a valid email address.")
        setLoading(false)
      } else if (password !== confirmPassword) {
        setError("Passwords do not match. Please try again.")
        setLoading(false)
      } else if (password.length < 8) {
        setError("Password must be at least 8 characters long.")
        setLoading(false)
      } else {
        console.log("Signup attempt:", { fullName, email, password })
        // Redirect to onboarding flow
        window.location.href = "/auth/onboard/personal"
      }
    }, 1000)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#F0F0F0]">Create your account</h1>
          <p className="text-[#B0B0B8]">Get started with professional OTC trading</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20"
            />
            <p className="text-[#B0B0B8] text-xs mt-2">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F0F0F0] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
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
            {loading ? "Creating account..." : "Create account"}
          </motion.button>

          {/* Terms */}
          <p className="text-xs text-[#B0B0B8] text-center">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-[#641AE4] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#641AE4] hover:underline">
              Privacy Policy
            </a>
          </p>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2D2D3D]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1E1E2B] text-[#B0B0B8]">Already have an account?</span>
          </div>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
          >
            Sign in instead
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
