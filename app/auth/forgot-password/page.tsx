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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setSubmitted(true)
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

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#F0F0F0] mb-2">Reset Your Password</h2>
              <p className="text-[#B0B0B8] text-sm">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            {!submitted ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
                  />
                </div>

                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/40 transition-all"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </motion.button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <div className="inline-block p-4 bg-[#C8F55A]/10 rounded-full">
                  <div className="text-[#C8F55A] text-3xl">✓</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">Check Your Email</h3>
                  <p className="text-[#B0B0B8] text-sm">
                    We've sent a password reset link to <span className="text-[#F0F0F0] font-medium">{email}</span>
                  </p>
                </div>
              </motion.div>
            )}

            <a href="/auth/login" className="block text-center text-sm text-[#641AE4] hover:underline">
              Back to Sign In
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
