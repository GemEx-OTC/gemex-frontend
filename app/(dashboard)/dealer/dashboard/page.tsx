"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"
import { useDealerDashboard } from "@/lib/hooks/use-dashboard"
import { formatDistanceToNow } from "date-fns"

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

function formatCurrency(amount: number, currency: "NGN" | "USD" = "NGN"): string {
  if (currency === "NGN") {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    }
    return `₦${amount.toLocaleString()}`
  }
  return `$${amount.toLocaleString()}`
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Pending":
    case "Quoted":
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30"
    case "Approved":
    case "Settled":
    case "CryptoConfirmed":
      return "bg-green-500/20 text-green-400 border border-green-500/30"
    case "Rejected":
    case "Cancelled":
    case "Expired":
      return "bg-red-500/20 text-red-400 border border-red-500/30"
    case "AwaitingDeposit":
    case "PayoutPending":
      return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
  }
}

export default function DealerDashboardPage() {
  const { data, isLoading, error } = useDealerDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-500 mb-4">Failed to load dashboard data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  const metrics = data?.metrics || {
    totalLocked: 0,
    awaitingPayouts: 0,
    payoutBalance: 0,
    pendingPayoutCount: 0,
  }

  const exchangeRates = data?.exchangeRates || {
    USDT_NGN: 0,
    USDC_NGN: 0,
    BTC_USD: 0,
    USD_NGN: 0,
    BTC_NGN: 0,
    lastUpdated: new Date().toISOString(),
  }

  const recentQuotes = data?.recentQuotes || []

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
              {formatCurrency(metrics.totalLocked)}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-green-600 dark:text-green-400">In active trades</p>
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
              {formatCurrency(metrics.awaitingPayouts)}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-amber-600 dark:text-amber-400">Pending settlement</p>
        </div>

        {/* Payout Balance */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Volume</p>
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
              {formatCurrency(metrics.payoutBalance)}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-blue-600 dark:text-blue-400">Settled trades</p>
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
              key={metrics.pendingPayoutCount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              {metrics.pendingPayoutCount}
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
          <p className="text-2xl font-bold text-foreground mb-1">₦{exchangeRates.USDT_NGN.toLocaleString()}</p>
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
          <p className="text-2xl font-bold text-foreground mb-1">${exchangeRates.BTC_USD.toLocaleString()}</p>
          <p className="text-sm text-orange-600 dark:text-orange-400">Live market rate</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border-2 border-teal-500/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">₦</span>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">USD/NGN Rate</p>
            </div>
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">₦{exchangeRates.USD_NGN.toLocaleString()}</p>
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
          <p className="text-2xl font-bold text-foreground mb-1">{formatCurrency(exchangeRates.BTC_NGN)}</p>
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
        {recentQuotes.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No recent quotes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuotes.slice(0, 5).map((quote, idx) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-secondary text-sm font-bold">{quote.quoteId}</span>
                    <span className="text-foreground font-medium">{quote.customer}</span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {quote.cryptoAmount} {quote.cryptoAsset} • ₦{quote.estimatedNaira.toLocaleString()} •{" "}
                    {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                  {quote.status === "Pending" && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-all">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground border border-border hover:bg-muted transition-all">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
            {data?.pendingQuotes ? (
              <p className="text-sm text-primary mt-2">{data.pendingQuotes} pending quotes</p>
            ) : null}
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
            {metrics.pendingPayoutCount > 0 ? (
              <p className="text-sm text-secondary mt-2">{metrics.pendingPayoutCount} pending payouts</p>
            ) : null}
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
