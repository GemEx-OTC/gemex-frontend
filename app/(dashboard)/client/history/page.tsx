"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { DataTable } from "@/components/data-table"
import { TRANSACTION_STATUS } from "@/lib/constants"

const mockTrades = [
  {
    id: "TXN001",
    cryptoAsset: "BTC",
    cryptoAmount: "2.5",
    nairaAmount: "₦108,750,000",
    status: "Settled",
    date: "2024-12-04",
    rate: "₦43.5M",
  },
  {
    id: "TXN002",
    cryptoAsset: "USDT",
    cryptoAmount: "5,000",
    nairaAmount: "₦7,825,000",
    status: "PayoutPending",
    date: "2024-12-04",
    rate: "₦1,565",
  },
  {
    id: "TXN003",
    cryptoAsset: "USDT",
    cryptoAmount: "10,000",
    nairaAmount: "₦15,650,000",
    status: "CryptoConfirmed",
    date: "2024-12-04",
    rate: "₦1,565",
  },
  {
    id: "TXN004",
    cryptoAsset: "BTC",
    cryptoAmount: "1.0",
    nairaAmount: "₦43,500,000",
    status: "AwaitingDeposit",
    date: "2024-12-03",
    rate: "₦43.5M",
  },
  {
    id: "TXN005",
    cryptoAsset: "USDT",
    cryptoAmount: "500",
    nairaAmount: "₦782,500",
    status: "Failed",
    date: "2024-12-01",
    rate: "₦1,565",
  },
  {
    id: "TXN006",
    cryptoAsset: "BTC",
    cryptoAmount: "0.5",
    nairaAmount: "₦21,750,000",
    status: "Settled",
    date: "2024-11-30",
    rate: "₦43.5M",
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all")

  const filteredTrades = filter === "all" ? mockTrades : mockTrades.filter((t) => t.status === filter)

  const columns = [
    {
      key: "id",
      label: "Trade ID",
      render: (value: string) => <span className="font-mono text-[#C8F55A]">{value}</span>,
    },
    {
      key: "cryptoAsset",
      label: "Asset",
      render: (value: string, row: any) => (
        <div>
          <div className="font-semibold text-[#F0F0F0]">{value}</div>
          <div className="text-xs text-[#B0B0B8]">{row.cryptoAmount}</div>
        </div>
      ),
    },
    {
      key: "nairaAmount",
      label: "Naira Amount",
      render: (value: string) => <span className="font-bold text-[#C8F55A]">{value}</span>,
    },
    {
      key: "rate",
      label: "Rate",
      render: (value: string) => <span className="text-[#B0B0B8]">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusInfo = TRANSACTION_STATUS[value as keyof typeof TRANSACTION_STATUS]
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => <span className="text-[#B0B0B8]">{value}</span>,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Trade History" subtitle="View all your completed and pending trades" />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All Trades" },
          { value: "Settled", label: "Settled" },
          { value: "PayoutPending", label: "Payout Pending" },
          { value: "AwaitingDeposit", label: "Awaiting Deposit" },
          { value: "Failed", label: "Failed" },
        ].map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.value ? "bg-[#641AE4] text-white" : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg overflow-hidden">
        {filteredTrades.length > 0 ? (
          <DataTable key={filter} columns={columns} data={filteredTrades} />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#B0B0B8]">No trades found in this category</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
