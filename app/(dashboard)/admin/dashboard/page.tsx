"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

export default function AdminDashboardPage() {
  const [systemMetrics] = useState({
    totalUsers: 2847,
    activeToday: 341,
    verifiedUsers: 2650,
    pendingKyc: 197,
  })

  const [exchangeRates] = useState<ExchangeRates>({
    nairaToUSDT: 1565,
    btcToNaira: 43500000,
    lastUpdated: new Date().toISOString(),
  })

  const [recentActivity] = useState([
    { action: "User Verified", detail: "john.doe@email.com", time: "1 min ago", type: "success" },
    { action: "Trade Settled", detail: "$45,230", time: "5 min ago", type: "info" },
    { action: "User Suspended", detail: "suspicious.account@email.com", time: "12 min ago", type: "warning" },
    { action: "Rate Updated", detail: "₦1,565/USDT", time: "28 min ago", type: "info" },
  ])

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

      {/* System Metrics - Colorful Gradient Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Users - Primary metric */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{systemMetrics.totalUsers.toLocaleString()}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Registered accounts</p>
        </div>

        {/* Active Today */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Today</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{systemMetrics.activeToday.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-400">Online now</p>
        </div>

        {/* Verified Users */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Verified Users</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{systemMetrics.verifiedUsers.toLocaleString()}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">✓ KYC Compliant</p>
        </div>

        {/* Pending KYC */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending KYC</p>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{systemMetrics.pendingKyc}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">⏳ Review needed</p>
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

      {/* Recent Activity Log */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <Link href="/admin/audit" className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "warning"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-foreground font-medium">{activity.action}</div>
                  <div className="text-muted-foreground text-sm">{activity.detail}</div>
                </div>
              </div>
              <div className="text-muted-foreground text-sm">{activity.time}</div>
            </motion.div>
          ))}
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

        <Link href="/admin/settings">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-foreground mb-1">Rate Settings</h3>
            <p className="text-sm text-muted-foreground">Configure exchange rates and trading parameters</p>
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
