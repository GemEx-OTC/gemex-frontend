"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useLogin } from "@/lib/hooks/use-auth"
import type { ApiError } from "@/lib/api/types"

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
  
  const router = useRouter()
  const loginMutation = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please fill in all fields to continue.")
      return
    }

    // Validate email format
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }

    // Call the API
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Login successful!")
        },
        onError: (err: ApiError) => {
          if (err.code === 'EMAIL_NOT_VERIFIED') {
            toast.info("Please verify your email to continue.")
            const verifyEmail = err.data?.email || email
            router.push(`/auth/verify-email?email=${encodeURIComponent(verifyEmail)}`)
          } else if (err.code === 'MUST_CHANGE_PASSWORD') {
            toast.info("Please set a new password to continue.")
            const tempToken = err.data?.accessToken
            if (tempToken) {
              window.location.href = `/auth/set-password?token=${encodeURIComponent(tempToken)}`
            } else {
              toast.error("Password change required but session expired. Please try again.")
            }
          } else {
            toast.error(err.message || "Invalid credentials. Please try again.")
          }
        },
      }
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
      <motion.div variants={formVariants} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your trading dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="gemex-input px-4 py-3.5"
              disabled={loginMutation.isPending}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <a href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="gemex-input px-4 py-3.5"
              disabled={loginMutation.isPending}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loginMutation.isPending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-lg font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">New to GemOTC?</span>
          </div>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <a href="/auth/signup" className="gemex-button-outline w-full py-3.5">
            Create an account
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
