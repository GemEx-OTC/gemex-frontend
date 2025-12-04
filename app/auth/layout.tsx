"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="w-12 h-12 relative">
            <Image src="/images/gemex-20logo.png" alt="GemEx" fill className="object-contain" />
          </div>
        </motion.div>

        {/* Main Card with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#641AE4] to-transparent opacity-20 blur-2xl" />
          <div className="relative bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#2d2d3d] rounded-2xl p-8 shadow-2xl">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
