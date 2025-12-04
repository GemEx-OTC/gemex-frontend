"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { KycProgressBar } from "@/components/kyc-progress-bar"

const spinVariants = {
  animate: {
    rotate: 360,
    transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
  },
}

export default function PendingVerificationPage() {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8 text-center">
          <KycProgressBar currentStep={4} totalSteps={4} />

          <div className="space-y-8 py-8">
            <motion.div variants={spinVariants} animate="animate" className="flex justify-center">
              <div className="w-24 h-24 border-4 border-transparent border-t-[#641AE4] border-r-[#9A24D2] rounded-full" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold text-[#F0F0F0] mb-2">Verification in Progress</h1>
              <p className="text-[#B0B0B8] text-lg">
                We're reviewing your information. This typically takes 1-2 minutes.
              </p>
            </div>

            <div className="p-6 bg-[#2D2D3D] rounded-lg border border-[#641AE4]/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#B0B0B8] font-medium">Time elapsed</span>
                <span className="text-[#C8F55A] font-mono font-bold text-lg">{formatTime(timeElapsed)}</span>
              </div>
              <div className="h-2 bg-[#1E1E2B] rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    x: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="h-full w-1/4 bg-[#641AE4]"
                />
              </div>
            </div>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-[#C8F55A] mt-1">✓</span>
                <div>
                  <p className="text-[#F0F0F0] font-medium">Personal information verified</p>
                  <p className="text-[#B0B0B8] text-sm">Your details are secure</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C8F55A] mt-1">✓</span>
                <div>
                  <p className="text-[#F0F0F0] font-medium">Document scanned</p>
                  <p className="text-[#B0B0B8] text-sm">ID authenticity confirmed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <motion.span
                  animate={{ opacity: [0.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="text-[#C8F55A] mt-1"
                >
                  ⏳
                </motion.span>
                <div>
                  <p className="text-[#F0F0F0] font-medium">AML screening</p>
                  <p className="text-[#B0B0B8] text-sm">Processing...</p>
                </div>
              </div>
            </div>

            <p className="text-[#B0B0B8] text-sm">
              You'll receive a confirmation email once your account is verified. Check your spam folder if needed.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
