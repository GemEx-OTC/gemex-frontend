"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Lock, TrendingUp } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E1E2B] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-2 border-[#641AE4] border-t-[#C8F55A] rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#1E1E2B]">
      {/* Navigation */}
      <nav className="backdrop-blur-md border-b border-[#2d2d3d] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 relative">
              <Image src="/images/gemex-20logo.png" alt="GemEx" fill className="object-contain" />
            </div>
            <span className="font-semibold text-[#F0F0F0]">GemEx</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            <Link href="/auth/login" className="px-4 py-2 text-[#F0F0F0] hover:text-[#641AE4] transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 bg-[#641AE4] text-white rounded-lg hover:bg-[#9A24D2] transition-colors font-medium"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-[#F0F0F0] mb-6 text-balance"
          >
            Professional OTC Trading,{" "}
            <span className="bg-gradient-to-r from-[#641AE4] to-[#C8F55A] bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-[#B0B0B8] mb-8 max-w-2xl mx-auto">
            Trade crypto and fiat seamlessly with institutional-grade security, real-time rates, and 24/7 support. Your
            trusted OTC desk for professional traders.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#641AE4] text-white rounded-lg hover:bg-[#9A24D2] transition-all hover:shadow-lg hover:shadow-[#641AE4]/30 font-medium"
            >
              Create Account <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#2d2d3d] text-[#F0F0F0] rounded-lg hover:border-[#641AE4] transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mt-20"
        >
          {[
            {
              icon: TrendingUp,
              title: "Real-Time Rates",
              description: "Get live exchange rates updated every second for accurate pricing.",
            },
            {
              icon: Lock,
              title: "Bank-Grade Security",
              description: "AML-compliant with KYC verification and non-custodial wallet support.",
            },
            {
              icon: TrendingUp,
              title: "24/7 Support",
              description: "Dedicated support team ready to assist with your trading needs.",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-[#1E1E2B] border border-[#2d2d3d] rounded-lg p-6 hover:border-[#641AE4] transition-colors backdrop-blur-sm"
              >
                <Icon className="w-8 h-8 text-[#641AE4] mb-4" />
                <h3 className="font-semibold text-[#F0F0F0] mb-2">{feature.title}</h3>
                <p className="text-[#B0B0B8] text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>
    </main>
  )
}
