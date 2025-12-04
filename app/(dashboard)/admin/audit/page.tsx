"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const auditLogs = [
    {
      timestamp: "2024-12-04 14:32:15",
      action: "User Verified",
      actor: "System",
      details: "KYC verification completed for user@email.com",
      severity: "info",
    },
    {
      timestamp: "2024-12-04 14:28:03",
      action: "Trade Settled",
      actor: "System",
      details: "Trade TRD001 marked as settled",
      severity: "info",
    },
    {
      timestamp: "2024-12-04 14:15:42",
      action: "Exchange Rate Updated",
      actor: "admin@gemex.com",
      details: "BTC/NGN rate changed from 43.2M to 43.5M",
      severity: "warning",
    },
    {
      timestamp: "2024-12-04 14:02:18",
      action: "User Suspended",
      actor: "admin@gemex.com",
      details: "User account suspended due to AML flag",
      severity: "critical",
    },
    {
      timestamp: "2024-12-04 13:55:30",
      action: "Quote Rejected",
      actor: "dealer@gemex.com",
      details: "Quote QT005 rejected by dealer",
      severity: "info",
    },
  ]

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-[#641AE4]/20 text-[#641AE4]"
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="Audit Logs"
        subtitle="Complete record of all system activities and administrative actions"
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 10 }} className="mb-6">
        <input
          type="text"
          placeholder="Search by action or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
        />
      </motion.div>

      <div className="space-y-3">
        {filteredLogs.map((log, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                  {log.action}
                </span>
                <span className="text-[#B0B0B8] text-sm font-mono">{log.timestamp}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#B0B0B8] text-xs">Actor</span>
                <div className="text-[#F0F0F0] font-medium">{log.actor}</div>
              </div>
              <div className="md:col-span-3">
                <span className="text-[#B0B0B8] text-xs">Details</span>
                <div className="text-[#F0F0F0]">{log.details}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <p className="text-[#B0B0B8]">No audit logs match your search</p>
        </motion.div>
      )}
    </motion.div>
  )
}
