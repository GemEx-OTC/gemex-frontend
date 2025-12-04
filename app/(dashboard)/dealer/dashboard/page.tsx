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

export default function DealerDashboardPage() {
  const [metrics] = useState({
    totalLocked: "$2,450,000",
    awaitingPayouts: "$180,500",
    payoutBalance: "₦1.2M",
    pendingCount: 12,
  })

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

      {/* Key Metrics - Real-time Monitoring */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Amount Locked" value={metrics.totalLocked} accent="violet" isHighlight />
        <MetricCard label="Awaiting Payouts" value={metrics.awaitingPayouts} accent="purple" />
        <MetricCard label="Payout Balance" value={metrics.payoutBalance} accent="lime" />
        <MetricCard label="Pending Quotes" value={metrics.pendingCount} change="Active now" accent="violet" />
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
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quote.status === "Pending" ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-[#641AE4]/20 text-[#641AE4]"
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
