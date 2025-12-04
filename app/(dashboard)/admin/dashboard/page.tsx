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

export default function AdminDashboardPage() {
  const [systemMetrics] = useState({
    totalUsers: "2,847",
    activeToday: "341",
    verifiedUsers: "2,650",
    pendingKyc: "197",
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
        <MetricCard label="Total Users" value={systemMetrics.totalUsers} accent="violet" isHighlight />
        <MetricCard label="Active Today" value={systemMetrics.activeToday} accent="lime" />
        <MetricCard label="Verified Users" value={systemMetrics.verifiedUsers} change="✓ Compliant" accent="violet" />
        <MetricCard label="Pending KYC" value={systemMetrics.pendingKyc} change="⏳ Review needed" accent="purple" />
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
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
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
