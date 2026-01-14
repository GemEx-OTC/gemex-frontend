"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useResetPassword } from "@/lib/hooks/use-auth"
import { Lock, Eye, EyeOff, Check, X, KeyRound, Loader2 } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const resetPasswordMutation = useResetPassword()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isReady && !token) {
      toast.error("Invalid or missing reset token")
      router.replace("/auth/forgot-password")
    }
  }, [isReady, token, router])

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid reset token. Please request a new reset link.")
      return
    }

    if (!isValidPassword) {
      toast.error("Please ensure your password meets all requirements.")
      return
    }

    resetPasswordMutation.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          toast.success("Password reset successfully! Please login with your new password.")
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to reset password. The link may have expired.")
        },
      }
    )
  }

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={valid ? "text-green-400" : "text-muted-foreground"}>{text}</span>
    </div>
  )

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="gemex-input pl-10 pr-10 py-3.5"
                disabled={resetPasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="gemex-input pl-10 pr-10 py-3.5"
                disabled={resetPasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground mb-3">Password Requirements</p>
            <ValidationItem valid={hasMinLength} text="At least 8 characters" />
            <ValidationItem valid={hasUppercase} text="One uppercase letter" />
            <ValidationItem valid={hasLowercase} text="One lowercase letter" />
            <ValidationItem valid={hasNumber} text="One number" />
            <ValidationItem valid={passwordsMatch} text="Passwords match" />
          </div>

          <motion.button
            type="submit"
            disabled={resetPasswordMutation.isPending || !isValidPassword}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {resetPasswordMutation.isPending ? "Resetting password..." : "Reset Password"}
          </motion.button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <a href="/auth/login" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <span>←</span> Back to sign in
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
