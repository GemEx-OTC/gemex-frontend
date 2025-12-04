"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Shield, Lock, FileCheck, Wallet } from "lucide-react"

export default function KYCStartPage() {
  const router = useRouter()

  const features = [
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "We're required by law to verify your identity to prevent fraud and money laundering.",
    },
    {
      icon: Lock,
      title: "Your Data is Protected",
      description: "All information is encrypted and stored securely. We never share your data without consent.",
    },
    {
      icon: FileCheck,
      title: "Quick Verification",
      description: "The process takes just 5 minutes. Most accounts are verified within 24 hours.",
    },
    {
      icon: Wallet,
      title: "Full Trading Access",
      description: "Once verified, you'll have complete access to all trading features and higher limits.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#641AE4]/10 via-transparent to-[#C8F55A]/10 blur-3xl" />

        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#641AE4] to-[#9A24D2] mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F0F0F0] mb-4">
              Complete Your KYC Verification
            </h1>
            <p className="text-[#B0B0B8] text-lg max-w-2xl mx-auto">
              To comply with AML regulations and ensure the security of our platform, we need to verify your identity
              before you can start trading.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex gap-4 p-6 rounded-lg bg-[#2D2D3D]/50 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-[#641AE4]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#641AE4]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F0F0F0] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#B0B0B8]">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* What You'll Need */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-[#C8F55A] mb-3">What You'll Need:</h3>
            <ul className="space-y-2 text-[#F0F0F0]">
              <li className="flex items-center gap-2">
                <span className="text-[#C8F55A]">✓</span> Valid government-issued ID (Passport, Driver's License, or
                National ID)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C8F55A]">✓</span> Personal information (Name, Date of Birth, Address)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C8F55A]">✓</span> Wallet address for withdrawals (optional, can add later)
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/auth/onboard/personal")}
              className="px-8 py-4 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
            >
              Start Verification
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/client/dashboard")}
              className="px-8 py-4 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
            >
              I'll Do This Later
            </motion.button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center text-sm text-[#B0B0B8] mt-8"
          >
            Your trading will be limited until verification is complete. This usually takes less than 24 hours.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
