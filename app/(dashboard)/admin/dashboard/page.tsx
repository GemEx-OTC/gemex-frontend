"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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


export default function AdminDashboardPage() {
  const [systemMetrics] = useState({
    totalUsers: "2,847",
    activeToday: "341",
    verifiedUsers: "2,650",
    pendingKyc: "197",
  })

  // Exchange rates - in production, fetch from API
  const [exchangeRates] = useState<ExchangeRates>({
    nairaToUSDT: 1565, // 1 USDT = 1565 NGN
    btcToNaira: 43500000, // 1 BTC = 43,500,000 NGN
    lastUpdated: new Date().toISOString(),
  })

  const [recentActivity] = useState([
    { action: "User Verified", user: "john.doe@email.com", time: "1 min ago", status: "success" },
    { action: "Trade Settled", amount: "$45,230", time: "5 min ago", status: "info" },
    { action: "User Suspended", user: "suspicious.account@email.com", time: "12 min ago", status: "warning" },
    { action: "Rate Updated", rate: "₦1,565/USDT", time: "28 min ago", status: "info" },
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

      {/* System Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Users" value={systemMetrics.totalUsers} accent="primary" isHighlight />
        <MetricCard label="Active Today" value={systemMetrics.activeToday} accent="success" />
        <MetricCard label="Verified Users" value={systemMetrics.verifiedUsers} change="✓ Compliant" accent="secondary" />
        <MetricCard label="Pending KYC" value={systemMetrics.pendingKyc} change="⏳ Review needed" accent="warning" />
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

      {/* Recent Activity Log */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-[#F0F0F0] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full ${activity.status === "success"
                      ? "bg-[#C8F55A]"
                      : activity.status === "warning"
                        ? "bg-red-400"
                        : "bg-[#641AE4]"
                      }`}
                  />
                  <div className="flex-1">
                    <div className="text-[#F0F0F0] font-medium">{activity.action}</div>
                    <div className="text-[#B0B0B8] text-sm">{activity.user || activity.amount || activity.rate}</div>
                  </div>
                </div>
                <div className="text-[#B0B0B8] text-sm">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Admin Controls */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1">User Management</h3>
          <p className="text-sm text-[#B0B0B8]">Manage users, verify status, and handle suspensions</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
        >
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1">Rate Settings</h3>
          <p className="text-sm text-[#B0B0B8]">Configure exchange rates and trading parameters</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 rounded-lg bg-[#1E1E2B]/60 border border-[#2D2D3D] hover:border-[#641AE4]/40 transition-all cursor-pointer"
        >
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-semibold text-[#F0F0F0] mb-1">Audit Logs</h3>
          <p className="text-sm text-[#B0B0B8]">Review comprehensive activity and compliance logs</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
