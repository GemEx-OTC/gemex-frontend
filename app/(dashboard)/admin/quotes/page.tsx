"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Loader2, Eye, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"
import { getAdminQuotes, type AdminQuote } from "@/lib/api/admin"

// Asset icons
const ASSET_CONFIG = {
  USDT: { icon: "/icons/usdt.svg" },
  BTC: { icon: "/icons/btc.svg" },
  USDC: { icon: "/icons/usdc.svg" },
} as const

// Network icons
const NETWORK_CONFIG = {
  TRC20: { icon: "/icons/chains/tron.svg" },
  BSC: { icon: "/icons/chains/bnb.svg" },
  BTC: { icon: "/icons/btc.svg" },
} as const

type QuoteStatus = "Pending" | "Quoted" | "Accepted" | "Expired" | "Rejected" | "Canceled"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  Pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock },
  Quoted: { label: "Quoted", color: "text-blue-400", bg: "bg-blue-500/20", icon: CheckCircle },
  Accepted: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle },
  Expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-500/20", icon: Clock },
  Rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  Canceled: { label: "Canceled", color: "text-gray-400", bg: "bg-gray-500/20", icon: XCircle },
}

export default function AdminQuotesPage() {
  const [filter, setFilter] = useState<"all" | QuoteStatus>("all")
  const [quotes, setQuotes] = useState<AdminQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAdminQuotes({ 
        status: filter === "all" ? undefined : filter,
        page: pagination.page,
        limit: pagination.limit 
      })
      setQuotes(result.quotes)
      setPagination(prev => ({ ...prev, total: result.pagination.total, pages: result.pagination.pages }))
    } catch (err: any) {
      setError(err.message || "Failed to load quotes")
      console.error("Failed to fetch quotes:", err)
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.page, pagination.limit])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

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

  const getRateDifference = (systemRate: number, firmRate?: number) => {
    if (!firmRate) return 0
    return ((firmRate - systemRate) / systemRate) * 100
  }

  // Count by status
  const pendingCount = quotes.filter(q => q.status === "Pending").length
  const quotedCount = quotes.filter(q => q.status === "Quoted").length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Quotes Management" 
        subtitle="Monitor and track all quote requests across the platform" 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Total Quotes</div>
          <div className="text-2xl font-bold text-[#F0F0F0]">{pagination.total}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-amber-500/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-blue-500/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Quoted</div>
          <div className="text-2xl font-bold text-blue-400">{quotedCount}</div>
        </div>
        <div className="bg-[#1E1E2B]/80 border border-emerald-500/30 rounded-xl p-4">
          <div className="text-sm text-[#B0B0B8] mb-1">Accepted</div>
          <div className="text-2xl font-bold text-emerald-400">{quotes.filter(q => q.status === "Accepted").length}</div>
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
          { value: "Pending", label: "Pending" },
          { value: "Quoted", label: "Quoted" },
          { value: "Accepted", label: "Accepted" },
          { value: "Rejected", label: "Rejected" },
          { value: "Expired", label: "Expired" },
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

      {/* Quotes Table */}
      {!loading && (
        <div className="bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2D2D3D]">
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Asset</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#B0B0B8]">Dealer</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Amount</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Rate</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[#B0B0B8]">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[#B0B0B8]">Created</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, idx) => {
                  const statusConfig = STATUS_CONFIG[quote.status as QuoteStatus]
                  const assetConfig = ASSET_CONFIG[quote.cryptoAsset as keyof typeof ASSET_CONFIG]
                  const rateDiff = getRateDifference(quote.systemRate, quote.firmRate)
                  
                  return (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {assetConfig && (
                            <Image
                              src={assetConfig.icon}
                              alt={quote.cryptoAsset}
                              width={24}
                              height={24}
                            />
                          )}
                          <div>
                            <div className="font-semibold text-[#F0F0F0]">
                              {quote.cryptoAsset.toUpperCase() === "BTC"
                                ? quote.cryptoAmount.toFixed(8)
                                : quote.cryptoAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}{" "}
                              {quote.cryptoAsset}
                            </div>
                            <div className="text-xs text-[#B0B0B8]">{quote.cryptoNetwork}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#F0F0F0]">{quote.clientName}</div>
                        <div className="text-xs text-[#B0B0B8]">{quote.clientEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        {quote.dealerName ? (
                          <>
                            <div className="text-sm text-[#F0F0F0]">{quote.dealerName}</div>
                            <div className="text-xs text-[#B0B0B8]">{quote.dealerEmail}</div>
                          </>
                        ) : (
                          <span className="text-sm text-[#B0B0B8]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-[#F0F0F0]">
                          ₦{(quote.firmNairaAmount || quote.estimatedNaira).toLocaleString()}
                        </div>
                        <div className="text-xs text-[#B0B0B8]">
                          {quote.firmNairaAmount ? "Firm" : "Est."}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-[#F0F0F0]">
                          ₦{(quote.firmRate || quote.systemRate).toLocaleString()}
                        </div>
                        {quote.firmRate && rateDiff !== 0 && (
                          <div className={`text-xs flex items-center justify-end gap-1 ${rateDiff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {rateDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(rateDiff).toFixed(2)}%
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig?.bg} ${statusConfig?.color}`}>
                          {statusConfig?.label || quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-[#F0F0F0]">{getTimeSince(quote.createdAt)}</div>
                        <div className="text-xs text-[#B0B0B8]">{new Date(quote.createdAt).toLocaleDateString()}</div>
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
      {!loading && quotes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No quotes found</h3>
          <p className="text-[#B0B0B8]">
            {filter === "all" ? "No quotes in the system yet" : `No ${filter.toLowerCase()} quotes`}
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-[#B0B0B8]">
            Showing {quotes.length} of {pagination.total} quotes
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
