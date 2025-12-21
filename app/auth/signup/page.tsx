"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
}

type SignupStep = "details" | "otp"

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>("details")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [step, resendTimer])

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
        // Move to OTP verification step
        setStep("otp")
        setLoading(false)
        setResendTimer(60)
        setCanResend(false)
      }
    }, 1000)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return
    
    const newOtp = [...otp]
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    
    const focusIndex = Math.min(pastedData.length, 5)
    otpRefs.current[focusIndex]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const otpValue = otp.join("")
    
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      setLoading(false)
      return
    }

    // Simulate OTP verification
    setTimeout(() => {
      // For demo, accept any 6-digit code
      console.log("OTP verified:", otpValue)
      // Redirect to dashboard after successful verification
      window.location.href = "/client/dashboard"
    }, 1500)
  }

  const handleResendOtp = () => {
    if (!canResend) return
    
    setResendTimer(60)
    setCanResend(false)
    setOtp(["", "", "", "", "", ""])
    // In production, call API to resend OTP
    console.log("Resending OTP to:", email)
  }

  const handleBackToDetails = () => {
    setStep("details")
    setOtp(["", "", "", "", "", ""])
    setError("")
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === "details" ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="space-y-2 mb-8">
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
                  {loading ? "Creating account..." : "Continue"}
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
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2D2D3D]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1E1E2B] text-[#B0B0B8]">Already have an account?</span>
                </div>
              </div>

              {/* Sign in link */}
              <div className="text-center mt-8">
                <a
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
                >
                  Sign in instead
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* OTP Header */}
              <div className="space-y-2 mb-8">
                <button
                  onClick={handleBackToDetails}
                  className="flex items-center gap-2 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h1 className="text-3xl font-bold text-[#F0F0F0]">Verify your email</h1>
                <p className="text-[#B0B0B8]">
                  We've sent a 6-digit code to <span className="text-[#F0F0F0] font-medium">{email}</span>
                </p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* OTP Input */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 text-center text-xl font-bold bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20"
                    />
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </motion.button>

                {/* Resend OTP */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#641AE4] hover:text-[#9A24D2] font-medium transition-colors"
                    >
                      Resend code
                    </button>
                  ) : (
                    <p className="text-[#B0B0B8]">
                      Resend code in <span className="text-[#F0F0F0] font-medium">{resendTimer}s</span>
                    </p>
                  )}
                </div>
              </form>

              {/* Help text */}
              <div className="mt-8 p-4 bg-[#2D2D3D]/30 rounded-lg">
                <p className="text-sm text-[#B0B0B8] text-center">
                  Didn't receive the code? Check your spam folder or{" "}
                  <button
                    onClick={handleBackToDetails}
                    className="text-[#641AE4] hover:underline"
                  >
                    try a different email
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
