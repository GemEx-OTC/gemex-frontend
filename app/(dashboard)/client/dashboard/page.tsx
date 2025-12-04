"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import Link from "next/link"

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ClientDashboardPage() {
  const [metrics] = useState({
    fiatBalance: "₦2,500,000.00",
    monthlyVolume: "$45,230.50",
    pendingTrades: 3,
    completedTrades: 28,
  })

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="Welcome Back"
        subtitle="Here's your trading overview for today"
        action={{
          label: "Request New Quote",
          onClick: () => (window.location.href = "/client/trade"),
        }}
      />

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Fiat Balance" value={metrics.fiatBalance} accent="lime" isHighlight />
        <MetricCard
          label="Monthly Volume"
          value={metrics.monthlyVolume}
          change="↑ 12% from last month"
          accent="violet"
        />
        <MetricCard label="Pending Trades" value={metrics.pendingTrades} accent="purple" />
        <MetricCard label="Completed Trades" value={metrics.completedTrades} change="This month" accent="violet" />
      </motion.div>

      {/* Main CTA Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/client/trade">
          <div className="relative bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl p-12 text-center cursor-pointer hover:border-[#641AE4]/60 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#641AE4]/0 via-[#C8F55A]/5 to-[#641AE4]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="relative text-5xl mb-4 inline-block"
            >
              💱
            </motion.div>

            <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2 relative z-10">Ready to Trade?</h2>
            <p className="text-[#B0B0B8] mb-6 relative z-10">Get instant quotes for crypto and fiat conversions</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 px-8 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
            >
              Get Quote Now
            </motion.button>
          </div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/client/history">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">📜</div>
            <h3 className="font-semibold text-[#F0F0F0] mb-1">Trade History</h3>
            <p className="text-sm text-[#B0B0B8]">View all your past trades and transactions</p>
          </motion.div>
        </Link>

        <Link href="/client/wallet">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-[#F0F0F0] mb-1">Wallet Address</h3>
            <p className="text-sm text-[#B0B0B8]">View and manage your deposit wallet</p>
          </motion.div>
        </Link>

        <Link href="/client/settings">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-[#F0F0F0] mb-1">Account Settings</h3>
            <p className="text-sm text-[#B0B0B8]">Update your profile and preferences</p>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
