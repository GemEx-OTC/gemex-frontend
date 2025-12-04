"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DealerTradesPage() {
  const [trades] = useState([
    {
      id: "TRD001",
      quote: "QT001",
      customer: "Chioma O.",
      amount: "$25,000",
      received: "₦39,062,500",
      status: "settled",
      time: "1 hour ago",
    },
    {
      id: "TRD002",
      quote: "QT002",
      customer: "Tunde M.",
      amount: "5 BTC",
      received: "₦217,500,000",
      status: "processing",
      time: "15 min ago",
    },
    {
      id: "TRD003",
      quote: "QT004",
      customer: "Emeka N.",
      amount: "10 ETH",
      received: "₦28,500,000",
      status: "settled",
      time: "2 hours ago",
    },
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Trade Processing" subtitle="Monitor and manage active and completed trades" />

      <div className="space-y-4">
        {trades.map((trade) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg hover:border-[#641AE4]/40 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div>
                <div className="font-mono text-[#C8F55A] text-sm font-bold">{trade.id}</div>
                <div className="text-[#B0B0B8] text-sm">{trade.customer}</div>
              </div>
              <div>
                <div className="text-[#F0F0F0] font-semibold">{trade.amount}</div>
                <div className="text-[#B0B0B8] text-sm">Sent</div>
              </div>
              <div>
                <div className="text-[#C8F55A] font-semibold">{trade.received}</div>
                <div className="text-[#B0B0B8] text-sm">Received</div>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trade.status === "settled" ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-[#641AE4]/20 text-[#641AE4]"
                  }`}
                >
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </span>
              </div>
              <div className="text-[#B0B0B8] text-sm text-right">{trade.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
