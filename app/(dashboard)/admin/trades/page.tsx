"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, Wallet, CreditCard, ArrowRightLeft } from "lucide-react"
import Image from "next/image"
import { getAdminTrades, type AdminTrade } from "@/lib/api/admin"

// Asset icons
const ASSET_CONFIG = {
  USDT: { icon: "/icons/usdt.svg" },
  BTC: { icon: "/icons/btc.svg" },
  USDC: { icon: "/icons/usdc.svg" },
} as const

type TradeStatus = "AwaitingDeposit" | "CryptoConfirmed" | "PayoutPending" | "Settled" | "Failed"

const STATUS_CONFIG: Record<TradeStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  AwaitingDeposit: { label: "Awaiting Deposit", color: "text-amber-400", bg: "bg-amber-500/20", icon: Wallet },
  CryptoConfirmed: { label: "Crypto Confirmed", color: "text-blue-400", bg: "bg-blue-500/20", icon: CheckCircle },
  PayoutPending: { label: "Payout Pending", color: "text-purple-400", bg: "bg-purple-500/20", icon: CreditCard },
  Settled: { label: "Settled", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle },
  Failed: { label: "Failed", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
}

export default function AdminTradesPage() {
  const [filter, setFilter] = useState<"all" | TradeStatus>("all")
  const [trades, setTrades] = useState<AdminTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAdminTrades({ 
        status: filter === "all" ? undefined : filter,
        page: pagination.page,
        limit: pagination.limit 
      })
      setTrades(result.trades)
      setPagination(prev => ({ ...prev, total: result.pagination.total, pages: result.pagination.pages }))
    } catch (err: any) {
      setError(err.message || "Failed to load trades")
      console.error("Failed to fetch trades:", err)
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.page, pagination.limit])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  const getTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  // Calculate totals
  const totalVolume = trades.reduce((sum, t) => sum + t.nairaAmount, 0)
  const settledCount = trades.filter(t => t.status === "Settled").length
  const pendingCount = trades.filter(t => ["AwaitingDeposit", "CryptoConfirmed", "PayoutPending"].includes(t.status)).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Trades Management" 
        subtitle="Monitor and track all trades across the platform" 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-[#F0F0F0]">{pagination.total}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-[#C8F55A]/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Total Volume</div>
          <div className="text-2xl font-bold text-[#C8F55A]">₦{totalVolume.toLocaleString()}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-emerald-500/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Settled</div>
          <div className="text-2xl font-bold text-emerald-400">{settledCount}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-amber-500/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "AwaitingDeposit", label: "Awaiting Deposit" },
          { value: "CryptoConfirmed", label: "Crypto Confirmed" },
          { value: "PayoutPending", label: "Payout Pending" },
          { value: "Settled", label: "Settled" },
          { value: "Failed", label: "Failed" },
        ].map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === tab.value 
                ? "bg-[#641AE4] text-white" 
                : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#641AE4] animate-spin" />
        </div>
      )}

      {/* Trades Table */}
      {!loading && (
        <div className="bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2D3D]">
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Transaction</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Dealer</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Crypto</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Naira</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[#B0B0B8]">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Created</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, idx) => {
                  const statusConfig = STATUS_CONFIG[trade.status as TradeStatus]
                  const assetConfig = ASSET_CONFIG[trade.cryptoAsset as keyof typeof ASSET_CONFIG]
                  
                  return (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm text-[#F0F0F0]">{trade.transactionId}</div>
                        <div className="text-xs text-[#B0B0B8]">{trade.cryptoNetwork}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#F0F0F0]">{trade.clientName}</div>
                        <div className="text-xs text-[#B0B0B8]">{trade.clientEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#F0F0F0]">{trade.dealerName}</div>
                        <div className="text-xs text-[#B0B0B8]">{trade.dealerEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {assetConfig && (
                            <Image
                              src={assetConfig.icon}
                              alt={trade.cryptoAsset}
                              width={20}
                              height={20}
                            />
                          )}
                          <span className="font-semibold text-[#F0F0F0]">
                            {trade.cryptoAmount.toLocaleString()} {trade.cryptoAsset}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-[#C8F55A]">
                          ₦{trade.nairaAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-[#B0B0B8]">
                          @ ₦{trade.rate.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.bg} ${statusConfig?.color}`}>
                          {statusConfig?.label || trade.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-[#F0F0F0]">{getTimeSince(trade.createdAt)}</div>
                        <div className="text-xs text-[#B0B0B8]">{new Date(trade.createdAt).toLocaleDateString()}</div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && trades.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <ArrowRightLeft className="w-12 h-12 text-[#2D2D3D] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No trades found</h3>
          <p className="text-[#B0B0B8]">
            {filter === "all" ? "No trades in the system yet" : `No ${filter.toLowerCase()} trades`}
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-[#B0B0B8]">
            Showing {trades.length} of {pagination.total} trades
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </motion.button>
            <motion.button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
