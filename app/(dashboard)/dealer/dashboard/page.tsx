"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
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

  const [exchangeRates] = useState<ExchangeRates>({
    nairaToUSDT: 1565,
    btcToNaira: 43500000,
    lastUpdated: new Date().toISOString(),
  })

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

      {/* Key Metrics - Colorful Gradient Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Amount Locked - Primary metric */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Amount Locked</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.totalLocked}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              ${metrics.totalLocked.toLocaleString()}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-green-600 dark:text-green-400">Live tracking</p>
        </div>

        {/* Awaiting Payouts */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Awaiting Payouts</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.awaitingPayouts}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              ${metrics.awaitingPayouts.toLocaleString()}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-amber-600 dark:text-amber-400">Pending settlement</p>
        </div>

        {/* Payout Balance */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Payout Balance</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.payoutBalance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              ₦{(metrics.payoutBalance / 1000).toFixed(1)}M
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-blue-600 dark:text-blue-400">Available funds</p>
        </div>

        {/* Pending Payouts Count */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pending Payouts</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.pendingCount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              {metrics.pendingCount}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-purple-600 dark:text-purple-400">Active now</p>
        </div>
      </motion.div>

      {/* Exchange Rates Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">USDT/USDC Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦{exchangeRates.nairaToUSDT.toLocaleString()}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Per 1 USD</p>
        </div>

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Quote Requests</h2>
          <Link href="/dealer/quotes" className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentQuotes.map((quote, idx) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-secondary text-sm font-bold">{quote.id}</span>
                  <span className="text-foreground font-medium">{quote.customer}</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {quote.amount} • {quote.time}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    quote.status === "Pending"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
                >
                  {quote.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-all">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground border border-border hover:bg-muted transition-all">
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dealer/quotes">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/30 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-foreground mb-1">Quote Queue</h3>
            <p className="text-sm text-muted-foreground">Manage pending and approved trade requests</p>
          </motion.div>
        </Link>

        <Link href="/dealer/trades">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/5 border border-secondary/30 hover:border-secondary/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">💼</div>
            <h3 className="font-semibold text-foreground mb-1">Trade Processing</h3>
            <p className="text-sm text-muted-foreground">Review and approve trade settlements</p>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
