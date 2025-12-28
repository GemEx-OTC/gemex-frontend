"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"

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


interface ExchangeRates {
  nairaToUSDT: number
  btcToNaira: number
  lastUpdated: string
}

export default function DealerDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalLocked: 2450000,
    awaitingPayouts: 180500,
    payoutBalance: 1200000,
    pendingCount: 12,
  })

  // Exchange rates - in production, fetch from API
  const [exchangeRates] = useState<ExchangeRates>({
    nairaToUSDT: 1565, // 1 USDT = 1565 NGN
    btcToNaira: 43500000, // 1 BTC = 43,500,000 NGN
    lastUpdated: new Date().toISOString(),
  })

  // Simulate real-time data updates with pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        totalLocked: prev.totalLocked + Math.floor(Math.random() * 10000) - 5000,
        awaitingPayouts: prev.awaitingPayouts + Math.floor(Math.random() * 5000) - 2500,
        payoutBalance: prev.payoutBalance + Math.floor(Math.random() * 50000) - 25000,
        pendingCount: Math.max(0, prev.pendingCount + Math.floor(Math.random() * 3) - 1),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const [recentQuotes] = useState([
    { id: "QT001", customer: "Client A", amount: "$25,000", status: "Pending", time: "2 min ago" },
    { id: "QT002", customer: "Client B", amount: "5 BTC", status: "Approved", time: "15 min ago" },
    { id: "QT003", customer: "Client C", amount: "$50,000", status: "Pending", time: "28 min ago" },
  ])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="Dealer Operations"
        subtitle="Monitor live trading activity and manage quotes"
        action={{
          label: "View All Quotes",
          onClick: () => (window.location.href = "/dealer/quotes"),
        }}
      />

      {/* Key Metrics - Real-time Monitoring with Pulse Animation */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#B0B0B8]">Total Amount Locked</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#C8F55A]"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={metrics.totalLocked}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[#C8F55A]"
            >
              ${metrics.totalLocked.toLocaleString()}
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-[#B0B0B8] mt-1">Live</p>
        </div>

        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#B0B0B8]">Awaiting Payouts</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-2 h-2 rounded-full bg-[#9A24D2]"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={metrics.awaitingPayouts}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[#F0F0F0]"
            >
              ${metrics.awaitingPayouts.toLocaleString()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#B0B0B8]">Payout Balance</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="w-2 h-2 rounded-full bg-[#C8F55A]"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={metrics.payoutBalance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[#C8F55A]"
            >
              ₦{(metrics.payoutBalance / 1000).toFixed(1)}M
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#B0B0B8]">Pending Payouts</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="w-2 h-2 rounded-full bg-[#641AE4]"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={metrics.pendingCount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-[#F0F0F0]"
            >
              {metrics.pendingCount}
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-[#B0B0B8] mt-1">Active now</p>
        </div>
      </motion.div>

      {/* BTC Exchange Rates Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* USDT/USDC Rate */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">USDT/USDC Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦{exchangeRates.nairaToUSDT.toLocaleString()}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Per 1 USD</p>
        </div>
        {/* BTC/USD Rate */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border-2 border-orange-500/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">₿</span>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">BTC/USD Rate</p>
            </div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">$90,200</p>
          <p className="text-sm text-orange-600 dark:text-orange-400">Live market rate</p>
        </div>

        {/* BTC Rate per Dollar in Naira */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border-2 border-teal-500/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">₦</span>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">BTC Rate</p>
            </div>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦1,470</p>
          <p className="text-sm text-teal-600 dark:text-teal-400">USD to NGN</p>
        </div>

        {/* BTC/NGN Rate */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-2 border-indigo-500/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">₿₦</span>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">BTC/NGN Rate</p>
            </div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦132,500</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Direct rate</p>
        </div>
      </motion.div>

      {/* Active Quotes Queue */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#F0F0F0] mb-4">Recent Quote Requests</h2>
          <div className="space-y-3">
            {recentQuotes.map((quote, idx) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#2D2D3D] hover:bg-[#2D2D3D]/80 rounded-lg transition-all group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[#C8F55A] text-sm font-bold">{quote.id}</span>
                    <span className="text-[#F0F0F0] font-medium">{quote.customer}</span>
                  </div>
                  <div className="text-[#B0B0B8] text-sm">
                    {quote.amount} • {quote.time}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${quote.status === "Pending" ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-[#641AE4]/20 text-[#641AE4]"
                      }`}
                  >
                    {quote.status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-3 py-1 rounded-lg text-xs font-medium text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all">
                      Approve
                    </button>
                    <button className="px-3 py-1 rounded-lg text-xs font-medium text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-lg bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 hover:border-[#641AE4]/60 transition-all cursor-pointer"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1">Quote Queue</h3>
          <p className="text-sm text-[#B0B0B8]">Manage pending and approved trade requests</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-lg bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 hover:border-[#641AE4]/60 transition-all cursor-pointer"
        >
          <div className="text-3xl mb-3">💼</div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1">Trade Processing</h3>
          <p className="text-sm text-[#B0B0B8]">Review and approve trade settlements</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
