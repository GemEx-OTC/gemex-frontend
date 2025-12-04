"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import { TRANSACTION_STATUS, KYC_STATUS } from "@/lib/constants"
import Link from "next/link"
import { AlertCircle, Clock } from "lucide-react"

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
    monthlyVolume: 45230.5,
    pendingTrades: 3,
    completedTrades: 28,
    totalReceived: 12500000, // Total Naira received
  })

  // Mock user status - in production, fetch from API
  const [userStatus] = useState({
    kycStatus: "Verified" as keyof typeof KYC_STATUS,
    bankVerified: true,
    hasActiveQuote: false,
  })

  const [recentTransactions] = useState([
    {
      id: "TXN001",
      type: "CRYPTO_TO_NAIRA",
      cryptoAsset: "USDT",
      cryptoAmount: 1000,
      nairaAmount: 1565000,
      status: "Settled" as keyof typeof TRANSACTION_STATUS,
      createdAt: "2024-12-04T10:30:00Z",
    },
    {
      id: "TXN002",
      type: "CRYPTO_TO_NAIRA",
      cryptoAsset: "BTC",
      cryptoAmount: 0.05,
      nairaAmount: 2175000,
      status: "PayoutPending" as keyof typeof TRANSACTION_STATUS,
      createdAt: "2024-12-04T14:15:00Z",
    },
    {
      id: "TXN003",
      type: "CRYPTO_TO_NAIRA",
      cryptoAsset: "USDT",
      cryptoAmount: 500,
      nairaAmount: 782500,
      status: "AwaitingDeposit" as keyof typeof TRANSACTION_STATUS,
      createdAt: "2024-12-04T16:45:00Z",
    },
  ])

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

      {/* Account Status Alerts */}
      <AnimatePresence>
        {userStatus.kycStatus !== "Verified" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#641AE4] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">Complete Your Verification</h3>
                  <p className="text-[#B0B0B8] mb-4">
                    Your KYC verification is pending. Complete it to start trading with higher limits.
                  </p>
                  <Link
                    href="/auth/onboard/kyc-start"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-[#641AE4] hover:bg-[#9A24D2] transition-colors"
                  >
                    Complete Verification
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!userStatus.bankVerified && userStatus.kycStatus === "Verified" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">Add Your Bank Account</h3>
                  <p className="text-[#B0B0B8] mb-4">
                    Link your Nigerian bank account to receive Naira payouts instantly.
                  </p>
                  <Link
                    href="/client/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-opacity"
                  >
                    Add Bank Account
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Received"
          value={`₦${metrics.totalReceived.toLocaleString()}`}
          change="All time"
          accent="lime"
          isHighlight
        />
        <MetricCard
          label="Monthly Volume"
          value={`₦${metrics.monthlyVolume.toLocaleString()}`}
          change="↑ 12% from last month"
          accent="violet"
        />
        <MetricCard label="Pending Trades" value={metrics.pendingTrades.toString()} accent="purple" />
        <MetricCard
          label="Completed Trades"
          value={metrics.completedTrades.toString()}
          change="This month"
          accent="violet"
        />
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

      {/* Recent Transactions */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#F0F0F0]">Recent Transactions</h2>
          <Link href="/client/history" className="text-sm text-[#641AE4] hover:text-[#9A24D2] transition-colors">
            View All →
          </Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((tx, idx) => {
            const statusInfo = TRANSACTION_STATUS[tx.status]
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg p-4 hover:border-[#641AE4]/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#641AE4] to-[#9A24D2] flex items-center justify-center font-bold text-white">
                      {tx.cryptoAsset === "BTC" ? "₿" : tx.cryptoAsset === "USDT" ? "₮" : "$"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#F0F0F0]">
                        {tx.cryptoAmount} {tx.cryptoAsset}
                      </p>
                      <p className="text-sm text-[#B0B0B8]">{tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#C8F55A]">₦{tx.nairaAmount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#B0B0B8]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
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
            <h3 className="font-semibold text-[#F0F0F0] mb-1">Deposit Address</h3>
            <p className="text-sm text-[#B0B0B8]">Get your unique crypto deposit address</p>
          </motion.div>
        </Link>

        <Link href="/client/settings">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">🏦</div>
            <h3 className="font-semibold text-[#F0F0F0] mb-1">Bank Account</h3>
            <p className="text-sm text-[#B0B0B8]">Manage your Naira payout account</p>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
