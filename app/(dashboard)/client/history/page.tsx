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
    date: "04/12/2024",
    rate: "₦43.5M",
  },
  {
    id: "TXN002",
    cryptoAsset: "USDT",
    cryptoAmount: "5,000",
    nairaAmount: "₦7,825,000",
    status: "PayoutPending",
    date: "04/12/2024",
    rate: "₦1,565",
  },
  {
    id: "TXN003",
    cryptoAsset: "USDT",
    cryptoAmount: "10,000",
    nairaAmount: "₦15,650,000",
    status: "CryptoConfirmed",
    date: "04/12/2024",
    rate: "₦1,565",
  },
  {
    id: "TXN004",
    cryptoAsset: "BTC",
    cryptoAmount: "1.0",
    nairaAmount: "₦43,500,000",
    status: "AwaitingDeposit",
    date: "03/12/2024",
    rate: "₦43.5M",
  },
  {
    id: "TXN005",
    cryptoAsset: "USDT",
    cryptoAmount: "500",
    nairaAmount: "₦782,500",
    status: "Failed",
    date: "01/12/2024",
    rate: "₦1,565",
  },
  {
    id: "TXN006",
    cryptoAsset: "BTC",
    cryptoAmount: "0.5",
    nairaAmount: "₦21,750,000",
    status: "Settled",
    date: "30/11/2024",
    rate: "₦43.5M",
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState<string>("all")

  const filteredTrades = filter === "all" ? mockTrades : mockTrades.filter((t) => t.status === filter)

  // Helper function to format date to DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    // If already in DD/MM/YYYY format, return as is
    if (dateString.includes('/')) {
      return dateString
    }
    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const columns = [
    {
      key: "date",
      label: "Date",
      width: "120px",
      className: "min-w-[120px]",
      render: (value: string) => <span className="text-slate-300 font-medium">{formatDate(value)}</span>,
    },
    {
      key: "id",
      label: "Trade ID",
      width: "130px",
      className: "min-w-[130px]",
      render: (value: string) => (
        <span className="font-mono text-lime-400 text-sm md:text-base font-bold block truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: "cryptoAsset",
      label: "Asset",
      width: "140px",
      className: "min-w-[140px]",
      render: (value: string, row: any) => (
        <div className="font-semibold text-slate-100">
          <span className="text-base md:text-lg">{row.cryptoAmount}</span>
          <span className="ml-2 text-emerald-400 font-bold">{value}</span>
        </div>
      ),
    },
    {
      key: "nairaAmount",
      label: "Naira Amount",
      width: "160px",
      className: "min-w-[160px]",
      render: (value: string) => <span className="font-bold text-green-400 text-base md:text-lg">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      width: "160px",
      className: "min-w-[160px]",
      render: (value: string) => {
        const statusInfo = TRANSACTION_STATUS[value as keyof typeof TRANSACTION_STATUS]
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )
      },
    },
    {
      key: "rate",
      label: "Rate",
      width: "120px",
      className: "min-w-[120px]",
      render: (value: string) => <span className="text-emerald-400 dark:text-emerald-300 font-bold text-base md:text-lg">{value}</span>,
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
            className={`px-4 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-all ${
              filter === tab.value ? "bg-primary text-white shadow-lg" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {filteredTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <DataTable key={filter} columns={columns} data={filteredTrades} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-muted-foreground text-base font-medium">No trades found in this category</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
