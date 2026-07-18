"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1E1E2B] relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#641AE4]/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#9A24D2]/20 via-transparent to-transparent blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 relative">
                <Image src="/images/gemex-20logo.png" alt="GemOTC" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-[#F0F0F0]">GemOTC</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-[#F0F0F0] leading-tight">
                Institutional OTC Trading,{" "}
                <span className="bg-gradient-to-r from-[#641AE4] to-[#C8F55A] bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              <p className="text-lg text-[#B0B0B8] leading-relaxed">
                Trade crypto and fiat seamlessly with institutional-grade security, real-time rates, and 24/7 support.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {[
              { icon: "🔒", text: "Bank-grade security with AML compliance" },
              { icon: "⚡", text: "Real-time exchange rates updated every second" },
              { icon: "🌍", text: "24/7 support for all your trading needs" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-[#B0B0B8]">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/images/gemex-20logo.png" alt="GemOTC" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold text-[#F0F0F0]">GemOTC</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-[#2D2D3D]/40 backdrop-blur-sm border border-[#2D2D3D] rounded-2xl p-6 sm:p-8">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
