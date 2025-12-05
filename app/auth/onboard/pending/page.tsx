"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Clock, Mail, MessageSquare, CheckCircle } from "lucide-react"

export default function PendingVerificationPage() {
  const router = useRouter()
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    { icon: CheckCircle, label: "Personal Details", status: "complete" },
    { icon: CheckCircle, label: "Document Upload", status: "complete" },
    { icon: Clock, label: "Identity Verification", status: "pending" },
  ]

  return (
    <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#641AE4]/10 via-transparent to-[#9A24D2]/10 blur-3xl" />

        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 md:p-12">
          {/* Animated Pending Icon */}
          <motion.div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              {/* Rotating ring */}
              <motion.div
                style={{ rotate: rotation }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#641AE4] border-r-[#9A24D2]"
              />
              {/* Inner circle */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/20 flex items-center justify-center">
                <Clock className="w-12 h-12 text-[#641AE4]" />
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-[#F0F0F0] mb-4">Verification in Progress</h1>
            <p className="text-[#B0B0B8] text-lg">
              Thank you for submitting your information! Our team is reviewing your documents.
            </p>
          </motion.div>

          {/* Status Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-8"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    step.status === "complete"
                      ? "bg-[#C8F55A]/10 border border-[#C8F55A]/30"
                      : "bg-[#641AE4]/10 border border-[#641AE4]/30"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${step.status === "complete" ? "text-[#C8F55A]" : "text-[#641AE4]"}`}
                  />
                  <span className="flex-1 font-medium text-[#F0F0F0]">{step.label}</span>
                  {step.status === "complete" ? (
                    <span className="text-sm text-[#C8F55A]">✓ Complete</span>
                  ) : (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-sm text-[#641AE4]"
                    >
                      In Review...
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-[#2D2D3D]/50 border border-[#2D2D3D] rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#641AE4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F0F0F0] mb-2">Email Notification</h3>
                  <p className="text-sm text-[#B0B0B8]">
                    We'll send you an email as soon as your account is verified and ready to use.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#2D2D3D]/50 border border-[#2D2D3D] rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#641AE4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#F0F0F0] mb-2">SMS Alert</h3>
                  <p className="text-sm text-[#B0B0B8]">
                    You'll also receive an SMS notification when your verification is complete.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-[#C8F55A] mb-3">⏱️ Typical Verification Time</h3>
            <p className="text-[#F0F0F0] mb-2">
              Most accounts are verified within <strong>24 hours</strong> during business days.
            </p>
            <p className="text-sm text-[#B0B0B8]">
              If we need additional information, we'll reach out via email or phone.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-col gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/client/dashboard")}
              className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
            >
              Go to Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
            >
              Return Home
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-sm text-[#B0B0B8] mt-8"
          >
            Need help? Contact our support team at{" "}
            <a href="mailto:support@gemex.com" className="text-[#641AE4] hover:underline">
              support@gemex.com
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
