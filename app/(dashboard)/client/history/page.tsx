"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"

const mockTrades = [
  { id: "TRX001", from: "2.5 BTC", to: "₦108,750,000", status: "Settled", date: "2024-12-04", rate: "43.5M" },
  { id: "TRX002", from: "5 ETH", to: "₦14,250,000", status: "Settled", date: "2024-12-03", rate: "2.85M" },
  { id: "TRX003", from: "10,000 USDT", to: "₦15,650,000", status: "Pending", date: "2024-12-04", rate: "1565" },
  { id: "TRX004", from: "1 BTC", to: "₦43,500,000", status: "Settled", date: "2024-12-02", rate: "43.5M" },
  { id: "TRX005", from: "500 USDT", to: "₦782,500", status: "Canceled", date: "2024-12-01", rate: "1565" },
]

export default function HistoryPage() {
  const columns = [
    { key: "id", label: "Trade ID" },
    { key: "from", label: "Sent" },
    { key: "to", label: "Received" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "Settled"
              ? "bg-[#C8F55A]/20 text-[#C8F55A]"
              : value === "Pending"
                ? "bg-[#641AE4]/20 text-[#641AE4]"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    { key: "rate", label: "Rate" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Trade History" subtitle="View all your completed and pending trades" />

      <div className="bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg overflow-hidden">
        <DataTable columns={columns} data={mockTrades} />
      </div>
    </motion.div>
  )
}
