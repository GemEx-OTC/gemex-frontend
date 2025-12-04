"use client"

import { motion } from "framer-motion"
import { GemExLogo } from "@/components/gemex-logo"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function KycStartPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#641AE4]/10 via-transparent to-[#9A24D2]/10 blur-3xl" />

        <motion.div variants={itemVariants} className="relative text-center mb-8">
          <div className="flex justify-center mb-6">
            <GemExLogo size={56} />
          </div>
          <h1 className="text-4xl font-bold text-[#F0F0F0] mb-3">Complete Your Verification</h1>
          <p className="text-[#B0B0B8] text-lg">
            We're excited to have you onboard. To comply with regulations and protect your account, we need to verify
            your identity.
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {[
            { icon: "🔒", title: "Security", desc: "Your information is encrypted and protected" },
            { icon: "⚖️", title: "Compliance", desc: "We follow AML and KYC regulations globally" },
            { icon: "✓", title: "Quick Process", desc: "Complete verification in under 5 minutes" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative flex gap-4 p-4 bg-[#1E1E2B]/60 backdrop-blur-sm border border-[#2D2D3D] rounded-lg"
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#F0F0F0] mb-1">{item.title}</h3>
                <p className="text-sm text-[#B0B0B8]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Link href="/auth/onboard/personal">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
          >
            Begin Verification
          </motion.button>
        </Link>

        <p className="text-center text-sm text-[#B0B0B8] mt-6">
          Questions?{" "}
          <a href="#" className="text-[#641AE4] hover:underline">
            Contact support
          </a>
        </p>
      </motion.div>
    </div>
  )
}
