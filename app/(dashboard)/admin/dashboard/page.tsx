"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { FloatingRateDock } from "@/components/floating-rate-dock"
import Link from "next/link"
import { useAdminDashboard } from "@/lib/hooks/use-admin"
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Users, 
  Handshake,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  BarChart3,
  ScrollText,
  CheckCircle2,
  Timer,
  ArrowRightLeft
} from "lucide-react"
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

const formatCompactNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
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
        subtitle="Oversee platform health and trading activity"
        action={{
          label: "View All Trades",
          onClick: () => (window.location.href = "/admin/trades"),
        }}
      />

      {/* Trade Summary - Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard.trades.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Trades</p>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard.trades.settled.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Settled Trades</p>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Timer className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard.trades.pending.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Pending Trades</p>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCompactNumber(dashboard.trades.totalVolume)}</p>
          <p className="text-sm text-muted-foreground">Total Volume (NGN)</p>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Trade Volume Details */}
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-xl bg-card border border-border h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Trade Volume Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Settled Volume</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(dashboard.trades.settledVolume)}</p>
                <p className="text-sm text-muted-foreground mt-1">{dashboard.trades.settled} trades completed</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Volume</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(dashboard.trades.pendingVolume)}</p>
                <p className="text-sm text-muted-foreground mt-1">{dashboard.trades.pending} trades in progress</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Recent Activity Preview */}
        <motion.div variants={itemVariants}>
          <div className="p-6 rounded-xl bg-card border border-border h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {dashboard.recentActivity.length > 0 ? (
                dashboard.recentActivity.slice(0, 3).map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.severity === "critical"
                          ? "bg-red-500"
                          : activity.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.action.replace(/_/g, ' ')}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </div>
            <Link href="/admin/audit" className="block mt-4 text-sm text-primary hover:text-primary/80 transition-colors text-center">
              View All Activity →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating Rate Dock */}
      <FloatingRateDock exchangeRates={dashboard.exchangeRates} />

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/trades">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-green-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <ArrowRightLeft className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Trades</h4>
                  <p className="text-xs text-muted-foreground">Monitor all trades</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/users">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Users</h4>
                  <p className="text-xs text-muted-foreground">Manage clients</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/dealers">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Handshake className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Dealers</h4>
                  <p className="text-xs text-muted-foreground">Manage dealers</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/audit">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-amber-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <ScrollText className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Audit Logs</h4>
                  <p className="text-xs text-muted-foreground">Review activity</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
