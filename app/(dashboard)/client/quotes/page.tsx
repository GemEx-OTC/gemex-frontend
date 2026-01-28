"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, TrendingUp, TrendingDown, Timer, X, Copy, Check, ExternalLink, Wallet, Loader2 } from "lucide-react"
import Image from "next/image"
import { getQuotes, acceptQuote, cancelQuote, type Quote, type QuoteStatus, type AcceptQuoteResponse } from "@/lib/api/quotes"

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

type ModalStep = "accept" | "deposit" | "confirmed"

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  Pending: { label: "Awaiting Quote", color: "text-blue-400", bg: "bg-blue-500/20", icon: Clock },
  Quoted: { label: "Quote Ready", color: "text-[#C8F55A]", bg: "bg-[#C8F55A]/20", icon: CheckCircle },
  Accepted: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle },
  Expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-500/20", icon: Clock },
  Rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/20", icon: XCircle },
  Canceled: { label: "Canceled", color: "text-gray-400", bg: "bg-gray-500/20", icon: XCircle },
}

export default function ClientQuotesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | QuoteStatus>("all")
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [tradeData, setTradeData] = useState<AcceptQuoteResponse["trade"] | null>(null)
  const [modalStep, setModalStep] = useState<ModalStep>("accept")
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const quotedCount = quotes.filter(q => q.status === "Quoted").length
  const pendingCount = quotes.filter(q => q.status === "Pending").length

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    if (diff <= 0) return "Expired"
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m remaining`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m remaining`
  }

  const getRateDifference = (systemRate: number, firmRate: number) => {
    const diff = ((firmRate - systemRate) / systemRate) * 100
    return diff
  }

  const getDealerName = (quote: Quote) => {
    if (typeof quote.dealerId === 'object' && quote.dealerId?.fullName) {
      return quote.dealerId.fullName
    }
    return "Dealer"
  }

  const handleOpenAcceptModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setModalStep("accept")
    setShowModal(true)
  }

  const handleAcceptQuote = async () => {
    if (!selectedQuote) return

    setProcessing(true)
    try {
      const result = await acceptQuote(selectedQuote._id)
      setTradeData(result.trade)
      setModalStep("deposit")
      fetchQuotes()
    } catch (err: any) {
      setError(err.message || "Failed to accept quote")
      setShowModal(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmDeposit = () => {
    setModalStep("confirmed")
  }

  const handleCopyAddress = async () => {
    if (tradeData?.depositAddress) {
      await navigator.clipboard.writeText(tradeData.depositAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCloseModal = () => {
    if (!processing) {
      setShowModal(false)
      setSelectedQuote(null)
      setTradeData(null)
      setModalStep("accept")
    }
  }

  const handleCancelQuote = async (quoteId: string) => {
    try {
      await cancelQuote(quoteId)
      fetchQuotes()
    } catch (err: any) {
      setError(err.message || "Failed to cancel quote")
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="My Quotes"
        subtitle="View and manage your bulk trade quote requests"
        action={{
          label: "Request Quote",
          onClick: () => router.push("/client/trade")
        }}
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

      {/* Action Required Banners */}
      {
        quotedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C8F55A]/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#C8F55A]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#F0F0F0]">
                  {quotedCount} quote{quotedCount > 1 ? "s" : ""} ready for review
                </p>
                <p className="text-sm text-[#B0B0B8]">Review and accept before they expire</p>
              </div>
              <motion.button
                onClick={() => setFilter("Quoted")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
              >
                View
              </motion.button>
            </div>
          </motion.div>
        )
      }

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "Quoted", label: "Ready", count: quotedCount },
          { value: "Pending", label: "Pending", count: pendingCount },
          { value: "Accepted", label: "Completed" },
        ].map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${filter === tab.value
              ? "bg-[#641AE4] text-white"
              : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
              }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${filter === tab.value
                ? "bg-white/30 text-white"
                : "bg-[#C8F55A]/20 text-[#C8F55A]"
                }`}>
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {
        loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#641AE4] animate-spin" />
          </div>
        )
      }

      {/* Quotes List */}
      {
        !loading && (
          <div className="space-y-3">
            {quotes.map((quote, idx) => {
              const statusConfig = STATUS_CONFIG[quote.status]
              const assetConfig = ASSET_CONFIG[quote.cryptoAsset as keyof typeof ASSET_CONFIG]
              const networkConfig = NETWORK_CONFIG[quote.cryptoNetwork as keyof typeof NETWORK_CONFIG]
              const rateDiff = quote.firmRate ? getRateDifference(quote.systemRate, quote.firmRate) : 0

              return (
                <motion.div
                  key={quote._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 bg-[#1E1E2B]/80 border rounded-xl transition-all ${quote.status === "Quoted"
                    ? "border-[#C8F55A]/40 shadow-lg shadow-[#C8F55A]/10"
                    : "border-[#2D2D3D] hover:border-[#641AE4]/40"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Asset Info */}
                    <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F0F0F0]">
                            {quote.cryptoAmount.toLocaleString()} {quote.cryptoAsset}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#B0B0B8]">
                          <span>{CRYPTO_NETWORKS[quote.cryptoNetwork]?.name || quote.cryptoNetwork}</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{quote._id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right">
                      {quote.status === "Quoted" && quote.firmNairaAmount ? (
                        <>
                          <div className="font-bold text-lg text-[#C8F55A]">
                            ₦{quote.firmNairaAmount.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-xs">
                            <span className="text-[#B0B0B8]">Rate: ₦{quote.firmRate?.toLocaleString()}</span>
                            {rateDiff !== 0 && (
                              <span className={`flex items-center ${rateDiff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {rateDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {Math.abs(rateDiff).toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-[#F0F0F0]">
                            ₦{quote.estimatedNaira.toLocaleString()}
                          </div>
                          <div className="text-xs text-[#B0B0B8]">Estimated</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions for Quoted */}
                  {quote.status === "Quoted" && quote.expiresAt && (
                    <div className="mt-3 pt-3 border-t border-[#2D2D3D]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 font-medium">{getTimeRemaining(quote.expiresAt)}</span>
                          {quote.dealerId && (
                            <span className="text-[#B0B0B8]">• Quoted by {getDealerName(quote)}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleCancelQuote(quote._id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#F0F0F0] border border-[#2D2D3D] hover:border-red-500/50 hover:text-red-400 transition-all"
                          >
                            Decline
                          </motion.button>
                          <motion.button
                            onClick={() => handleOpenAcceptModal(quote)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all flex items-center gap-1"
                          >
                            Accept Quote
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Status */}
                  {quote.status === "Pending" && (
                    <div className="mt-3 pt-3 border-t border-[#2D2D3D]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[#B0B0B8]">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          <span>Waiting for dealer to provide firm quote...</span>
                        </div>
                        <motion.button
                          onClick={() => handleCancelQuote(quote._id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#B0B0B8] border border-[#2D2D3D] hover:border-red-500/50 hover:text-red-400 transition-all"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )
      }

      {/* Empty State */}
      {
        !loading && quotes.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No quotes found</h3>
            <p className="text-[#B0B0B8] mb-4">
              {filter === "all" ? "You haven't requested any quotes yet" : `No ${filter.toLowerCase()} quotes`}
            </p>
            <motion.button
              onClick={() => router.push("/client/trade")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
            >
              Request a Quote
            </motion.button>
          </motion.div>
        )
      }

      {/* Multi-Step Modal */}
      <AnimatePresence>
        {showModal && selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#1E1E2B] border-2 rounded-2xl p-6 max-w-md w-full ${modalStep === "confirmed"
                ? "border-emerald-500/40"
                : modalStep === "deposit"
                  ? "border-amber-500/40"
                  : "border-[#C8F55A]/40"
                }`}
            >
              {/* Step 1: Accept Quote */}
              {modalStep === "accept" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#F0F0F0]">Accept Quote</h3>
                    <button onClick={handleCloseModal} disabled={processing} className="p-2 rounded-lg hover:bg-[#2D2D3D] transition-all disabled:opacity-50">
                      <X className="w-5 h-5 text-[#B0B0B8]" />
                    </button>
                  </div>

                  <div className="bg-[#2D2D3D]/50 rounded-xl p-4 mb-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                        {ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG] && (
                          <Image src={ASSET_CONFIG[selectedQuote.cryptoAsset as keyof typeof ASSET_CONFIG].icon} alt={selectedQuote.cryptoAsset} width={24} height={24} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#F0F0F0]">{selectedQuote.cryptoAmount.toLocaleString()} {selectedQuote.cryptoAsset}</div>
                        <div className="text-sm text-[#B0B0B8]">{CRYPTO_NETWORKS[selectedQuote.cryptoNetwork]?.name || selectedQuote.cryptoNetwork}</div>
                      </div>
                    </div>
                    <div className="border-t border-[#2D2D3D] pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#B0B0B8]">Firm Rate</span>
                        <span className="text-[#F0F0F0] font-semibold">₦{selectedQuote.firmRate?.toLocaleString()} / {selectedQuote.cryptoAsset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#B0B0B8]">You'll Receive</span>
                        <span className="text-[#C8F55A] font-bold text-xl">₦{selectedQuote.firmNairaAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedQuote.firmRate && (
                    <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        {getRateDifference(selectedQuote.systemRate, selectedQuote.firmRate) >= 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">{getRateDifference(selectedQuote.systemRate, selectedQuote.firmRate).toFixed(2)}% better</span>
                            <span className="text-[#B0B0B8]">than system rate</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 font-medium">{Math.abs(getRateDifference(selectedQuote.systemRate, selectedQuote.firmRate)).toFixed(2)}% below</span>
                            <span className="text-[#B0B0B8]">system rate</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#B0B0B8]">
                        <span className="text-amber-400 font-medium">Next step:</span> After accepting, you'll receive a deposit address to send your crypto.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button onClick={handleCloseModal} disabled={processing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50">
                      Cancel
                    </motion.button>
                    <motion.button onClick={handleAcceptQuote} disabled={processing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>Accept Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}

              {/* Step 2: Deposit Instructions */}
              {modalStep === "deposit" && tradeData && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#F0F0F0]">Send Your Crypto</h3>
                    <button onClick={handleCloseModal} disabled={processing} className="p-2 rounded-lg hover:bg-[#2D2D3D] transition-all disabled:opacity-50">
                      <X className="w-5 h-5 text-[#B0B0B8]" />
                    </button>
                  </div>

                  {/* Amount to Send */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                          {ASSET_CONFIG[tradeData.cryptoAsset as keyof typeof ASSET_CONFIG] && (
                            <Image src={ASSET_CONFIG[tradeData.cryptoAsset as keyof typeof ASSET_CONFIG].icon} alt={tradeData.cryptoAsset} width={24} height={24} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-[#B0B0B8]">Send exactly</div>
                          <div className="font-bold text-amber-400 text-xl">{tradeData.cryptoAmount.toLocaleString()} {tradeData.cryptoAsset}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#B0B0B8]">
                        {NETWORK_CONFIG[tradeData.cryptoNetwork as keyof typeof NETWORK_CONFIG] && (
                          <Image src={NETWORK_CONFIG[tradeData.cryptoNetwork as keyof typeof NETWORK_CONFIG].icon} alt={tradeData.cryptoNetwork} width={14} height={14} />
                        )}
                        <span>{CRYPTO_NETWORKS[tradeData.cryptoNetwork]?.name || tradeData.cryptoNetwork}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Address */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Deposit Address</label>
                    <div className="bg-[#2D2D3D] rounded-lg p-4">
                      <div className="font-mono text-sm text-[#F0F0F0] break-all mb-3">
                        {tradeData.depositAddress}
                      </div>
                      <motion.button
                        onClick={handleCopyAddress}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${copied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#C8F55A]/20 text-[#C8F55A] border border-[#C8F55A]/30 hover:bg-[#C8F55A]/30"
                          }`}
                      >
                        {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Address</>}
                      </motion.button>
                    </div>
                  </div>

                  {/* You'll Receive */}
                  <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[#B0B0B8]">You'll receive</span>
                      <span className="text-[#C8F55A] font-bold text-xl">₦{tradeData.nairaAmount?.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[#B0B0B8] mt-2">Payout will be sent to your linked bank account after confirmation.</p>
                  </div>

                  {/* Warning */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-[#B0B0B8]">
                        <p className="text-red-400 font-medium mb-1">Important:</p>
                        <ul className="space-y-1">
                          <li>• Only send <span className="text-[#F0F0F0] font-semibold">{tradeData.cryptoAsset}</span> to this address</li>
                          <li>• Use <span className="text-[#F0F0F0] font-semibold">{CRYPTO_NETWORKS[tradeData.cryptoNetwork]?.name || tradeData.cryptoNetwork}</span> network only</li>
                          <li>• Wrong network = permanent loss of funds</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button onClick={handleCloseModal} disabled={processing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50">
                      Close
                    </motion.button>
                    <motion.button onClick={handleConfirmDeposit} disabled={processing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-amber-400 hover:shadow-lg hover:shadow-amber-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {processing ? "Confirming..." : <><span>I've Sent the Crypto</span><ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                  </div>
                </>
              )}

              {/* Step 3: Confirmation */}
              {modalStep === "confirmed" && tradeData && (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[#F0F0F0] mb-2">Deposit Submitted!</h3>
                    <p className="text-sm text-[#B0B0B8]">We're monitoring the blockchain for your transaction.</p>
                  </div>

                  <div className="bg-[#2D2D3D]/50 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Transaction ID</span>
                      <span className="text-[#F0F0F0] font-mono">{tradeData.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Amount</span>
                      <span className="text-[#F0F0F0] font-semibold">{tradeData.cryptoAmount.toLocaleString()} {tradeData.cryptoAsset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Network</span>
                      <span className="text-[#F0F0F0]">{CRYPTO_NETWORKS[tradeData.cryptoNetwork]?.name || tradeData.cryptoNetwork}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-[#2D2D3D]">
                      <span className="text-[#B0B0B8]">You'll Receive</span>
                      <span className="text-[#C8F55A] font-bold">₦{tradeData.nairaAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-[#F0F0F0] mb-2">What happens next?</h4>
                    <ul className="text-sm text-[#B0B0B8] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#641AE4]">1.</span>
                        <span>We detect your deposit on the blockchain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#641AE4]">2.</span>
                        <span>Transaction is confirmed (usually 1-3 mins)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#641AE4]">3.</span>
                        <span>Naira is sent to your bank account</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => router.push("/client/history")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all flex items-center justify-center gap-2"
                    >
                      View History
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={handleCloseModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
                    >
                      Done
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  )
}
