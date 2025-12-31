"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { Clock, CheckCircle, XCircle, AlertCircle, X, TrendingUp, TrendingDown, User, Calendar, Loader2 } from "lucide-react"
import Image from "next/image"
import { getQuotes, generateFirmQuote, rejectQuote, type Quote, type QuoteStatus } from "@/lib/api/quotes"

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

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  Pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/20", icon: Clock },
  Quoted: { label: "Quoted", color: "text-blue-400", bg: "bg-blue-500/20", icon: CheckCircle },
  Accepted: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle },
  Expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-500/20", icon: Clock },
  Rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  Canceled: { label: "Canceled", color: "text-gray-400", bg: "bg-gray-500/20", icon: XCircle },
}

export default function DealerQuotesPage() {
  const [filter, setFilter] = useState<"all" | QuoteStatus>("all")
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [firmRate, setFirmRate] = useState("")
  const [processing, setProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getQuotes({ 
        status: filter === "all" ? undefined : filter,
        limit: 50 
      })
      setQuotes(result.quotes)
    } catch (err: any) {
      setError(err.message || "Failed to load quotes")
      console.error("Failed to fetch quotes:", err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const pendingCount = quotes.filter(q => q.status === "Pending").length

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

  const calculateFirmNaira = () => {
    if (!selectedQuote || !firmRate) return 0
    return selectedQuote.cryptoAmount * parseFloat(firmRate)
  }

  const getRateDifference = () => {
    if (!selectedQuote || !firmRate) return 0
    return ((parseFloat(firmRate) - selectedQuote.systemRate) / selectedQuote.systemRate) * 100
  }

  const handleOpenQuoteModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setFirmRate(quote.systemRate.toString())
    setShowQuoteModal(true)
  }

  const handleGenerateQuote = async () => {
    if (!selectedQuote || !firmRate) return
    
    setProcessing(true)
    try {
      await generateFirmQuote(selectedQuote._id, { firmRate: parseFloat(firmRate) })
      setShowQuoteModal(false)
      setSelectedQuote(null)
      setFirmRate("")
      fetchQuotes()
    } catch (err: any) {
      setError(err.message || "Failed to generate quote")
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenRejectModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setRejectReason("")
    setShowRejectModal(true)
  }

  const handleRejectQuote = async () => {
    if (!selectedQuote) return
    
    setProcessing(true)
    try {
      await rejectQuote(selectedQuote._id, { reason: rejectReason || undefined })
      setShowRejectModal(false)
      setSelectedQuote(null)
      setRejectReason("")
      fetchQuotes()
    } catch (err: any) {
      setError(err.message || "Failed to reject quote")
    } finally {
      setProcessing(false)
    }
  }

  const getClientName = (quote: Quote) => {
    if (typeof quote.clientId === 'object' && quote.clientId?.fullName) {
      return quote.clientId.fullName
    }
    return "Client"
  }

  const getClientEmail = (quote: Quote) => {
    if (typeof quote.clientId === 'object' && quote.clientId?.email) {
      return quote.clientId.email
    }
    return ""
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Quote Requests" 
        subtitle="Review and generate firm quotes for client bulk trades" 
      />

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
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#F0F0F0]">
                {pendingCount} pending request{pendingCount > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-[#B0B0B8]">
                Clients are waiting for your firm quotes
              </p>
            </div>
            <motion.button
              onClick={() => setFilter("Pending")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg font-semibold text-[#1E1E2B] bg-amber-400 hover:opacity-90 transition-all"
            >
              View Pending
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "Pending", label: "Pending", count: pendingCount },
          { value: "Quoted", label: "Quoted" },
          { value: "Accepted", label: "Accepted" },
          { value: "Rejected", label: "Rejected" },
        ].map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              filter === tab.value 
                ? "bg-[#641AE4] text-white" 
                : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                filter === tab.value ? "bg-white/20" : "bg-amber-500/30 text-amber-400"
              }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#641AE4] animate-spin" />
        </div>
      )}

      {/* Quotes List */}
      {!loading && (
        <div className="space-y-3">
          {quotes.map((quote, idx) => {
            const statusConfig = STATUS_CONFIG[quote.status]
            const assetConfig = ASSET_CONFIG[quote.cryptoAsset as keyof typeof ASSET_CONFIG]
            const networkConfig = NETWORK_CONFIG[quote.cryptoNetwork as keyof typeof NETWORK_CONFIG]
            
            return (
              <motion.div
                key={quote._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative p-4 bg-[#1E1E2B]/80 border rounded-xl transition-all ${
                  quote.status === "Pending"
                    ? "border-amber-500/40"
                    : "border-[#2D2D3D] hover:border-[#641AE4]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Client & Asset Info */}
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#2D2D3D] flex items-center justify-center">
                        {assetConfig && (
                          <Image
                            src={assetConfig.icon}
                            alt={quote.cryptoAsset}
                            width={28}
                            height={28}
                          />
                        )}
                      </div>
                      {networkConfig && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1E1E2B] flex items-center justify-center border border-[#2D2D3D]">
                          <Image
                            src={networkConfig.icon}
                            alt={quote.cryptoNetwork}
                            width={12}
                            height={12}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#F0F0F0]">
                          {quote.cryptoAmount.toLocaleString()} {quote.cryptoAsset}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#B0B0B8]">
                        <User className="w-3 h-3" />
                        <span>{getClientName(quote)}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">{quote._id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#B0B0B8] mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getTimeSince(quote.createdAt)}</span>
                        <span>•</span>
                        <span>{CRYPTO_NETWORKS[quote.cryptoNetwork]?.name || quote.cryptoNetwork}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right">
                    <div className="font-bold text-[#F0F0F0] text-lg">
                      ₦{quote.estimatedNaira.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#B0B0B8]">
                      @ ₦{quote.systemRate.toLocaleString()} (system)
                    </div>
                  </div>
                </div>

                {/* Actions for Pending */}
                {quote.status === "Pending" && (
                  <div className="mt-4 pt-4 border-t border-[#2D2D3D] flex gap-2 w-fit">
                    <motion.button
                      onClick={() => handleOpenRejectModal(quote)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[#F0F0F0] border border-[#2D2D3D] hover:border-red-500/50 hover:text-red-400 transition-all"
                    >
                      Reject
                    </motion.button>
                    <motion.button
                      onClick={() => handleOpenQuoteModal(quote)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all w-fit"
                    >
                      Generate Firm Quote
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && quotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No quote requests</h3>
          <p className="text-[#B0B0B8]">
            {filter === "all" 
              ? "No quote requests at the moment" 
              : `No ${filter.toLowerCase()} quotes`}
          </p>
        </motion.div>
      )}

      {/* Generate Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowQuoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border-2 border-[#641AE4]/40 rounded-2xl p-6 max-w-lg w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#F0F0F0]">Generate Firm Quote</h3>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  disabled={processing}
                  className="p-2 rounded-lg hover:bg-[#2D2D3D] transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-[#B0B0B8]" />
                </button>
              </div>

              {/* Client & Request Info */}
              <div className="bg-[#2D2D3D]/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#641AE4]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#641AE4]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#F0F0F0]">{getClientName(selectedQuote)}</div>
                    <div className="text-sm text-[#B0B0B8]">{getClientEmail(selectedQuote)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-[#2D2D3D]">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                    {ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG] && (
                      <Image
                        src={ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG].icon}
                        alt={selectedQuote.cryptoAsset}
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#F0F0F0]">
                      {selectedQuote.cryptoAmount.toLocaleString()} {selectedQuote.cryptoAsset}
                    </div>
                    <div className="text-sm text-[#B0B0B8]">
                      {CRYPTO_NETWORKS[selectedQuote.cryptoNetwork]?.name || selectedQuote.cryptoNetwork}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#B0B0B8]">System Rate</div>
                    <div className="font-semibold text-[#F0F0F0]">₦{selectedQuote.systemRate.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Firm Rate Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Your Firm Rate (NGN per {selectedQuote.cryptoAsset})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B0B8]">₦</span>
                  <input
                    type="number"
                    value={firmRate}
                    onChange={(e) => setFirmRate(e.target.value)}
                    className="w-full bg-[#2D2D3D] border-2 border-transparent focus:border-[#C8F55A] text-[#F0F0F0] text-xl font-bold pl-8 pr-4 py-3 rounded-lg transition-all focus:outline-none"
                    placeholder={selectedQuote.systemRate.toString()}
                  />
                </div>
                
                {/* Rate Comparison */}
                {firmRate && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {getRateDifference() >= 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">
                          {getRateDifference().toFixed(2)}% above system rate
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400">
                          {Math.abs(getRateDifference()).toFixed(2)}% below system rate
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Calculated Amount */}
              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#B0B0B8]">Client Will Receive</span>
                  <span className="text-[#C8F55A] font-bold text-2xl">
                    ₦{calculateFirmNaira().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#B0B0B8]">
                    <span className="text-amber-400 font-medium">Note:</span> Once generated, the client will be notified and can accept this quote within 15 minutes.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowQuoteModal(false)}
                  disabled={processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleGenerateQuote}
                  disabled={processing || !firmRate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Quote"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Quote Modal */}
      <AnimatePresence>
        {showRejectModal && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border-2 border-red-500/40 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#F0F0F0]">Reject Quote</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="p-2 rounded-lg hover:bg-[#2D2D3D] transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-[#B0B0B8]" />
                </button>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                    {ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG] && (
                      <Image
                        src={ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG].icon}
                        alt={selectedQuote.cryptoAsset}
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#F0F0F0]">
                      {selectedQuote.cryptoAmount.toLocaleString()} {selectedQuote.cryptoAsset}
                    </div>
                    <div className="text-sm text-[#B0B0B8]">{getClientName(selectedQuote)}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#2D2D3D] border-2 border-transparent focus:border-red-500/50 text-[#F0F0F0] px-4 py-3 rounded-lg transition-all focus:outline-none resize-none"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleRejectQuote}
                  disabled={processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    "Reject Quote"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
