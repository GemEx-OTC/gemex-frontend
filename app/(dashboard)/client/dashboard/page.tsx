"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import { TRANSACTION_STATUS, KYC_STATUS } from "@/lib/constants"
import { KycVerificationModal } from "@/components/kyc-verification-modal"
import Link from "next/link"
import { AlertCircle, Clock, Shield } from "lucide-react"

interface ExchangeRates {
  nairaToUSDT: number
  btcToNaira: number
  lastUpdated: string
}

interface DashboardMetrics {
  pendingTrades: number
  completedTrades: number
  totalReceivedNaira: number
  totalReceivedUSDT: number
}

interface UserStatus {
  kycStatus: keyof typeof KYC_STATUS
  bankVerified: boolean
  hasActiveQuote: boolean
}

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
  const [metrics] = useState<DashboardMetrics>({
    pendingTrades: 2,
    completedTrades: 28,
    totalReceivedNaira: 45750000, // Total Naira received (₦45.75M)
    totalReceivedUSDT: 29250, // Total crypto deposits in USD equivalent
  })

  // Exchange rates - in production, fetch from API
  const [exchangeRates] = useState<ExchangeRates>({
    nairaToUSDT: 1565, // 1 USDT = 1565 NGN
    btcToNaira: 43500000, // 1 BTC = 43,500,000 NGN
    lastUpdated: new Date().toISOString(),
  })

  // Helper function to format large numbers
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    return num.toLocaleString()
  }

  // Mock user status - in production, fetch from API
  const [userStatus, setUserStatus] = useState<UserStatus>({
    kycStatus: "Pending" as keyof typeof KYC_STATUS,
    bankVerified: true,
    hasActiveQuote: false,
  })

  // KYC Modal state
  const [showKycModal, setShowKycModal] = useState(false)

  const handleKycComplete = () => {
    setUserStatus(prev => ({ ...prev, kycStatus: "Verified" as keyof typeof KYC_STATUS }))
    setShowKycModal(false)
  }

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
          label: "Deposit",
          onClick: () => (window.location.href = "/client/wallet"),
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
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Complete Your Verification</h3>
                  <p className="text-muted-foreground mb-4">
                    Verify your identity to unlock full trading features and higher limits.
                  </p>
                  <button
                    onClick={() => setShowKycModal(true)}
                    className="gemex-button-primary"
                  >
                    Verify Now
                  </button>
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
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Add Your Bank Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Link your Nigerian bank account to receive Naira payouts instantly.
                  </p>
                  <Link
                    href="/client/settings"
                    className="gemex-button-secondary"
                  >
                    Add Bank Account
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Financial Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Payouts - Primary metric */}
        <div className="md:col-span-2 lg:col-span-1">
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Payouts</p>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">₦{metrics.totalReceivedNaira.toLocaleString()}</p>
            <p className="text-sm text-green-600 dark:text-green-400">All time earnings</p>
          </div>
        </div>

        {/* Total Deposits */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Deposits</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">${metrics.totalReceivedUSDT.toLocaleString()}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Crypto equivalent</p>
        </div>

        {/* Pending Payouts */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Payouts</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦{(2175000 + 782500).toLocaleString()}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">{metrics.pendingTrades} transactions</p>
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



      {/* Main CTA Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link href="/client/trade">
          <div className="relative bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/40 rounded-xl p-12 text-center cursor-pointer hover:border-primary/60 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-secondary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="relative text-5xl mb-4 inline-block"
            >
              💱
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-2 relative z-10">Ready for Bulk Trade?</h2>
            <p className="text-muted-foreground mb-6 relative z-10">Request quotes for large crypto-to-Naira conversions</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 gemex-button-secondary px-8 py-3"
            >
              Request Bulk Quote
            </motion.button>
          </div>
        </Link>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
          <Link href="/client/history" className="text-sm text-primary hover:text-primary/80 transition-colors">
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
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                      {tx.cryptoAsset === "BTC" ? "₿" : tx.cryptoAsset === "USDT" ? "₮" : "$"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {tx.cryptoAmount} {tx.cryptoAsset}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-secondary text-sm sm:text-base whitespace-nowrap">
                      ₦{tx.nairaAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`inline-flex items-center justify-center text-xs px-3 py-1.5 rounded-full font-semibold ${statusInfo.bg} ${statusInfo.color} whitespace-nowrap self-start sm:self-auto shadow-sm`}>
                    {statusInfo.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
<motion.div variants={itemVariants} className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/client/history">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">📜</div>
            <h3 className="font-semibold text-foreground mb-1">Trade History</h3>
            <p className="text-sm text-muted-foreground">View all your past trades and transactions</p>
          </motion.div>
        </Link>

        <Link href="/client/wallet">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-foreground mb-1">Deposit Address</h3>
            <p className="text-sm text-muted-foreground">Get your unique crypto deposit address</p>
          </motion.div>
        </Link>

        <Link href="/client/settings">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">🏦</div>
            <h3 className="font-semibold text-foreground mb-1">Bank Account</h3>
            <p className="text-sm text-muted-foreground">Manage your Naira payout account</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* KYC Verification Modal */}
      <KycVerificationModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        onComplete={handleKycComplete}
      />
    </motion.div>
  )
}
