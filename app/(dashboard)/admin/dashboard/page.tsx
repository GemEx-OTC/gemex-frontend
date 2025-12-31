"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"
import { useAdminDashboard } from "@/lib/hooks/use-admin"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getActivityType = (severity: string) => {
  switch (severity) {
    case 'critical': return 'warning'
    case 'warning': return 'warning'
    default: return 'info'
  }
}

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error, refetch } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#641AE4]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-red-400">Failed to load dashboard data</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-[#641AE4] text-white rounded-lg hover:bg-[#641AE4]/80"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="System Administration"
        subtitle="Oversee platform health, users, and compliance"
        action={{
          label: "User Management",
          onClick: () => (window.location.href = "/admin/users"),
        }}
      />

      {/* Client Metrics */}
      <motion.div variants={itemVariants} className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>👤</span> Client Accounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Clients</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.users.total}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.users.total.toLocaleString()}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-blue-600 dark:text-blue-400">Registered clients</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Today</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.users.activeToday}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.users.activeToday.toLocaleString()}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-green-600 dark:text-green-400">Clients logged in today</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Verified Clients</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.users.verified}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.users.verified.toLocaleString()}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-purple-600 dark:text-purple-400">✓ KYC Compliant</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending KYC</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.users.pendingKyc}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.users.pendingKyc}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-amber-600 dark:text-amber-400">⏳ Review needed</p>
          </div>
        </div>
      </motion.div>

      {/* Dealer Metrics */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>🤝</span> Dealer Accounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-2 border-cyan-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Total Dealers</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.dealers.total}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.dealers.total.toLocaleString()}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-cyan-600 dark:text-cyan-400">Registered dealers</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Dealers</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.dealers.active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.dealers.active}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-green-600 dark:text-green-400">Currently active</p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Verified Dealers</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={dashboard.dealers.verified}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {dashboard.dealers.verified}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-purple-600 dark:text-purple-400">✓ KYC Compliant</p>
          </div>
        </div>
      </motion.div>

      {/* Trade & Exchange Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">USDT/USDC Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            ₦{dashboard.exchangeRates.USDT_NGN.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Per 1 USD</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border-2 border-orange-500/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">₿</span>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">BTC/USD Rate</p>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-auto"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            ${dashboard.exchangeRates.BTC_USD.toLocaleString()}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">Live market rate</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border-2 border-teal-500/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">₦</span>
            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">USD/NGN Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            ₦{dashboard.exchangeRates.USD_NGN.toLocaleString()}
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400">USD to NGN</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-2 border-indigo-500/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Trades</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {dashboard.trades.total.toLocaleString()}
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            {formatCurrency(dashboard.trades.totalVolume)} volume
          </p>
        </div>
      </motion.div>

      {/* Trades Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✅</span>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Settled Trades</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {dashboard.trades.settled.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {formatCurrency(dashboard.trades.settledVolume)} settled
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⏳</span>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Trades</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {dashboard.trades.pending.toLocaleString()}
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {formatCurrency(dashboard.trades.pendingVolume)} pending
          </p>
        </div>
      </motion.div>

      {/* Recent Activity Log */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <Link href="/admin/audit" className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {dashboard.recentActivity.length > 0 ? (
            dashboard.recentActivity.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.severity === "critical"
                        ? "bg-red-500"
                        : activity.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{activity.action.replace(/_/g, ' ')}</div>
                    <div className="text-muted-foreground text-sm">{activity.details}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.actor}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </motion.div>

      {/* Admin Controls */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-foreground mb-1">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage users, verify status, and handle suspensions</p>
          </motion.div>
        </Link>

        <Link href="/admin/dealers">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-foreground mb-1">Dealer Management</h3>
            <p className="text-sm text-muted-foreground">Create and manage dealer accounts for high-volume trading</p>
          </motion.div>
        </Link>

        <Link href="/admin/audit">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-foreground mb-1">Audit Logs</h3>
            <p className="text-sm text-muted-foreground">Review comprehensive activity and compliance logs</p>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
