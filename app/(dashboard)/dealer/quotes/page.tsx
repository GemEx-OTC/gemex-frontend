"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

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

export default function DealerQuotesPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null)
  const [newQuoteGlow, setNewQuoteGlow] = useState<Record<string, boolean>>({})

  const quotes = [
    {
      id: "QT001",
      customer: "Chioma O.",
      amount: "$25,000",
      type: "BTC→NGN",
      status: "pending",
      createdAt: "2 min ago",
      isNew: true,
    },
    {
      id: "QT002",
      customer: "Tunde M.",
      amount: "5 BTC",
      type: "BTC→NGN",
      status: "approved",
      createdAt: "15 min ago",
      isNew: false,
    },
    {
      id: "QT003",
      customer: "Amara K.",
      amount: "$50,000",
      type: "USDT→NGN",
      status: "pending",
      createdAt: "28 min ago",
      isNew: false,
    },
    {
      id: "QT004",
      customer: "Emeka N.",
      amount: "10 ETH",
      type: "ETH→NGN",
      status: "approved",
      createdAt: "45 min ago",
      isNew: false,
    },
    {
      id: "QT005",
      customer: "Zainab A.",
      amount: "$15,000",
      type: "BTC→NGN",
      status: "rejected",
      createdAt: "1 hour ago",
      isNew: false,
    },
  ]

  // Fade out glow after 5 seconds for new quotes
  useEffect(() => {
    const newQuotes = quotes.filter((q) => q.isNew)
    const initialGlow: Record<string, boolean> = {}
    newQuotes.forEach((q) => {
      initialGlow[q.id] = true
    })
    setNewQuoteGlow(initialGlow)

    const timers = newQuotes.map((q) =>
      setTimeout(() => {
        setNewQuoteGlow((prev) => ({ ...prev, [q.id]: false }))
      }, 5000)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const filteredQuotes = quotes.filter((q) => filter === "all" || q.status === filter)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader title="Quote Queue" subtitle="Manage incoming quote requests from clients" />

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setFilter(tab)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab ? "bg-[#641AE4] text-white" : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} (
            {filteredQuotes.filter((q) => q.status === tab || tab === "all").length})
          </motion.button>
        ))}
      </motion.div>

      {/* Quotes List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredQuotes.map((quote, idx) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedQuote(selectedQuote === quote.id ? null : quote.id)}
            className={`relative p-5 bg-[#1E1E2B]/60 rounded-lg transition-all cursor-pointer group ${
              newQuoteGlow[quote.id]
                ? "border-2 border-[#641AE4] shadow-lg shadow-[#641AE4]/50"
                : "border border-[#2D2D3D] hover:border-[#641AE4]/40"
            }`}
          >
            {/* Glow effect for new quotes */}
            {newQuoteGlow[quote.id] && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 5 }}
                className="absolute inset-0 bg-gradient-to-r from-[#641AE4]/20 via-[#9A24D2]/20 to-transparent rounded-lg pointer-events-none"
              />
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[#C8F55A] text-sm font-bold">{quote.id}</span>
                    <span className="text-[#F0F0F0] font-semibold">{quote.customer}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#B0B0B8]">
                    <span>{quote.type}</span>
                    <span>•</span>
                    <span>{quote.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[#F0F0F0] font-bold text-lg">{quote.amount}</div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quote.status === "pending"
                        ? "bg-[#641AE4]/20 text-[#641AE4]"
                        : quote.status === "approved"
                          ? "bg-[#C8F55A]/20 text-[#C8F55A]"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {selectedQuote === quote.id && quote.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-[#2D2D3D] flex gap-2"
              >
                <button className="flex-1 px-4 py-2 rounded-lg font-medium text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all">
                  Approve Quote
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg font-medium text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all">
                  Reject
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {filteredQuotes.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-[#B0B0B8]">No quotes in this category</p>
        </motion.div>
      )}
    </motion.div>
  )
}
