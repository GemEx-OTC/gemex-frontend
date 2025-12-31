"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useForgotPassword } from "@/lib/hooks/use-auth"
import type { ApiError } from "@/lib/api/types"

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
  
  const forgotPasswordMutation = useForgotPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Reset link sent! Check your email.")
          setSubmitted(true)
        },
        onError: (err: ApiError) => {
          toast.error(err.message || "Failed to send reset link.")
        },
      }
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        {!submitted ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#F0F0F0]">Reset your password</h1>
              <p className="text-[#B0B0B8]">Enter your email and we'll send you a reset link</p>
            </div>

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
                  required
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20 disabled:opacity-50"
                />
              </div>

              <motion.button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-70"
              >
                {forgotPasswordMutation.isPending ? "Sending reset link..." : "Send reset link"}
              </motion.button>
            </form>

            <div className="text-center">
              <a href="/auth/login" className="inline-flex items-center gap-2 text-sm text-[#641AE4] hover:text-[#9A24D2] transition-colors">
                <span>←</span> Back to sign in
              </a>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8F55A]/20"
              >
                <div className="text-[#C8F55A] text-3xl">✓</div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#F0F0F0]">Check your email</h2>
                <p className="text-[#B0B0B8]">
                  We've sent a password reset link to<br />
                  <span className="text-[#F0F0F0] font-medium">{email}</span>
                </p>
              </div>

              <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4">
                <p className="text-sm text-[#B0B0B8]">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button onClick={() => setSubmitted(false)} className="text-[#641AE4] hover:underline">
                    try again
                  </button>
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <a href="/auth/login" className="inline-flex items-center justify-center w-full py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all">
                Back to sign in
              </a>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
