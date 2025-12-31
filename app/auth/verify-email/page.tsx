"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useVerifyEmail, useResendOtp } from "@/lib/hooks/use-auth"
import type { ApiError } from "@/lib/api/types"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  
  const [email] = useState(emailParam)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const verifyEmailMutation = useVerifyEmail()
  const resendOtpMutation = useResendOtp()

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  useEffect(() => {
    otpRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
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
    pastedData.split("").forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code.")
      return
    }
    if (!email) {
      toast.error("Email is required. Please go back to login.")
      return
    }
    verifyEmailMutation.mutate(
      { email, otp: otpValue },
      {
        onSuccess: () => {
          toast.success("Email verified successfully!")
        },
        onError: (err: ApiError) => {
          toast.error(err.message || "Invalid or expired code.")
        },
      }
    )
  }

  const handleResendOtp = () => {
    if (!canResend || !email) return
    setResendTimer(60)
    setCanResend(false)
    setOtp(["", "", "", "", "", ""])
    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Verification code sent!")
        },
        onError: (err: ApiError) => {
          toast.error(err.message || "Failed to resend code.")
        },
      }
    )
  }

  const isLoading = verifyEmailMutation.isPending || resendOtpMutation.isPending

  if (!email) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#F0F0F0]">Email Required</h1>
          <p className="text-[#B0B0B8]">Please login first to verify your email.</p>
          <a href="/auth/login" className="inline-block text-[#641AE4] hover:underline">Go to Login</a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-[#F0F0F0]">Verify your email</h1>
          <p className="text-[#B0B0B8]">
            We've sent a 6-digit code to <span className="text-[#F0F0F0] font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-bold bg-[#2D2D3D]/50 border border-[#2D2D3D] focus:border-[#641AE4] text-[#F0F0F0] rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#641AE4]/20 disabled:opacity-50"
              />
            ))}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
          </motion.button>

          <div className="text-center">
            {canResend ? (
              <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-[#641AE4] hover:text-[#9A24D2] font-medium transition-colors disabled:opacity-50">
                Resend code
              </button>
            ) : (
              <p className="text-[#B0B0B8]">Resend code in <span className="text-[#F0F0F0] font-medium">{resendTimer}s</span></p>
            )}
          </div>
        </form>

        <div className="mt-8 p-4 bg-[#2D2D3D]/30 rounded-lg">
          <p className="text-sm text-[#B0B0B8] text-center">
            Didn't receive the code? Check your spam folder or{" "}
            <a href="/auth/login" className="text-[#641AE4] hover:underline">try logging in again</a>
          </p>
        </div>

        <div className="text-center">
          <a href="/auth/login" className="inline-flex items-center gap-2 text-sm text-[#641AE4] hover:text-[#9A24D2] transition-colors">
            <span>←</span> Back to sign in
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#641AE4]"></div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
