"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { AlertCircle, Info, ArrowRight, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { createQuote } from "@/lib/api/quotes"

// Asset icons and brand colors
const ASSET_CONFIG = {
  USDT: {
    icon: "/icons/usdt.svg",
    brandColor: "#26A17B",
  },
  BTC: {
    icon: "/icons/btc.svg",
    brandColor: "#F7931A",
  },
  USDC: {
    icon: "/icons/usdc.svg",
    brandColor: "#2775CA",
  },
} as const

// Network/chain logos
const NETWORK_CONFIG = {
  TRC20: {
    icon: "/icons/chains/tron.svg",
    brandColor: "#FF060E",
  },
  BSC: {
    icon: "/icons/chains/bnb.svg",
    brandColor: "#F3BA2F",
  },
  BTC: {
    icon: "/icons/btc.svg",
    brandColor: "#F7931A",
  },
} as const

export default function TradeRequestPage() {
  const [step, setStep] = useState<"select" | "amount" | "submitted">("select")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tradeData, setTradeData] = useState({
    cryptoAsset: "USDT" as keyof typeof CRYPTO_ASSETS,
    cryptoNetwork: "TRC20" as keyof typeof CRYPTO_NETWORKS,
    cryptoAmount: "50000",
  })

  // Mock system rates
  const systemRates = {
    USDT: 1565,
    BTC: 43500000,
    USDC: 1565,
  }

  const handleSubmitRequest = async () => {
    setSubmitting(true)
    setError(null)
    
    try {
      await createQuote({
        cryptoAsset: tradeData.cryptoAsset,
        cryptoNetwork: tradeData.cryptoNetwork,
        cryptoAmount: Number.parseFloat(tradeData.cryptoAmount),
      })
      setStep("submitted")
    } catch (err: any) {
      setError(err.message || "Failed to submit quote request")
    } finally {
      setSubmitting(false)
    }
  }

  const systemRate = systemRates[tradeData.cryptoAsset]
  const estimatedNaira = Number.parseFloat(tradeData.cryptoAmount || "0") * systemRate
  const minAmount = tradeData.cryptoAsset === "BTC" ? 0.01 : 50000

  const steps = ["select", "amount", "submitted"]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="Request Bulk Trade Quote"
        subtitle="Get competitive rates for large crypto-to-Naira conversions"
      />

      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step === s
                    ? "bg-[#641AE4] text-white scale-110"
                    : idx < steps.indexOf(step)
                    ? "bg-[#C8F55A] text-[#1E1E2B]"
                    : "bg-[#2D2D3D] text-[#B0B0B8]"
                }`}
              >
                {idx < steps.indexOf(step) ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`w-10 md:w-16 h-0.5 mx-2 rounded-full transition-all ${
                    idx < steps.indexOf(step) ? "bg-[#C8F55A]" : "bg-[#2D2D3D]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Info Banner - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#641AE4] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#B0B0B8]">
              <span className="font-medium text-[#F0F0F0]">Process: </span>
              Submit request → Dealer quotes → Accept & send crypto → Receive Naira
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-5 md:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Select Asset & Network</h2>
                <p className="text-sm text-[#B0B0B8]">Choose the cryptocurrency and network for your bulk trade</p>
              </div>

              {/* Crypto Asset Selection - Compact */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Cryptocurrency</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CRYPTO_ASSETS).map(([key, asset]) => {
                    const config = ASSET_CONFIG[key as keyof typeof ASSET_CONFIG]
                    const isSelected = tradeData.cryptoAsset === key
                    return (
                      <motion.button
                        key={key}
                        onClick={() => {
                          setTradeData({ 
                            ...tradeData, 
                            cryptoAsset: key as keyof typeof CRYPTO_ASSETS,
                            cryptoNetwork: key === "BTC" ? "BTC" : "TRC20"
                          })
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-3 rounded-lg text-center font-medium transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-[#641AE4] to-[#9A24D2] text-white shadow-lg shadow-[#641AE4]/20"
                            : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]/80 border border-[#2D2D3D]"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-white/20" : "bg-[#1E1E2B]"
                          }`}>
                            <Image
                              src={config.icon}
                              alt={`${asset.symbol} icon`}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{asset.symbol}</div>
                            <div className="text-[10px] opacity-70">{asset.name}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="asset-check"
                            className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8F55A] rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-[#1E1E2B]" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Network Selection - Compact */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Network</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(CRYPTO_NETWORKS)
                    .filter(([key]) => {
                      if (tradeData.cryptoAsset === "BTC") return key === "BTC"
                      return key !== "BTC"
                    })
                    .map(([key, network]) => {
                      const config = NETWORK_CONFIG[key as keyof typeof NETWORK_CONFIG]
                      const isSelected = tradeData.cryptoNetwork === key
                      return (
                        <motion.button
                          key={key}
                          onClick={() =>
                            setTradeData({ ...tradeData, cryptoNetwork: key as keyof typeof CRYPTO_NETWORKS })
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-3 rounded-lg text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-[#641AE4] text-white shadow-md"
                              : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0] border border-[#2D2D3D]"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-white/20" : "bg-[#1E1E2B]"
                          }`}>
                            <Image
                              src={config.icon}
                              alt={`${network.name} icon`}
                              width={18}
                              height={18}
                              className="w-[18px] h-[18px]"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate">{network.name}</div>
                            <div className="text-[10px] opacity-70">{network.chain}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 ml-auto flex-shrink-0" />
                          )}
                        </motion.button>
                      )
                    })}
                </div>
              </div>

              <motion.button
                onClick={() => setStep("amount")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-5 md:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Enter Trade Amount</h2>
                <p className="text-sm text-[#B0B0B8]">Specify how much {tradeData.cryptoAsset} you want to trade</p>
              </div>

              {/* Selected Asset/Network Summary */}
              <div className="flex items-center gap-3 p-3 bg-[#2D2D3D]/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                    <Image
                      src={ASSET_CONFIG[tradeData.cryptoAsset].icon}
                      alt={tradeData.cryptoAsset}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="font-semibold text-[#F0F0F0]">{tradeData.cryptoAsset}</span>
                </div>
                <span className="text-[#B0B0B8]">on</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1E1E2B] flex items-center justify-center">
                    <Image
                      src={NETWORK_CONFIG[tradeData.cryptoNetwork].icon}
                      alt={tradeData.cryptoNetwork}
                      width={14}
                      height={14}
                    />
                  </div>
                  <span className="text-sm text-[#B0B0B8]">{CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-gradient-to-br from-[#2D2D3D]/80 to-[#2D2D3D]/40 border border-[#641AE4]/20 rounded-xl p-5">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-2">
                  Amount ({tradeData.cryptoAsset})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={tradeData.cryptoAmount}
                    onChange={(e) => setTradeData({ ...tradeData, cryptoAmount: e.target.value })}
                    placeholder="0.00"
                    min={minAmount}
                    className="w-full bg-transparent text-3xl md:text-4xl font-bold text-[#C8F55A] focus:outline-none placeholder-[#2D2D3D]"
                  />
                </div>
                <p className="text-xs text-[#B0B0B8] mt-1">
                  Min: {minAmount.toLocaleString()} {tradeData.cryptoAsset}
                </p>
                
                <div className="mt-4 pt-4 border-t border-[#2D2D3D]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#B0B0B8] text-sm">Estimated Naira</span>
                    <span className="text-[#F0F0F0] font-bold text-xl">
                      ₦{estimatedNaira.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#B0B0B8] mt-1">
                    Rate: ₦{systemRate.toLocaleString()} per {tradeData.cryptoAsset} (indicative)
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#B0B0B8]">
                    <span className="text-[#C8F55A] font-medium">Note:</span> Final rate set by dealer based on market conditions. You'll be notified when your firm quote is ready.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep("select")}
                  disabled={submitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all disabled:opacity-50"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={!tradeData.cryptoAmount || Number.parseFloat(tradeData.cryptoAmount) < minAmount || submitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Quote
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#C8F55A]/30 rounded-xl p-5 md:p-6 text-center space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8F55A]/20"
              >
                <Check className="w-8 h-8 text-[#C8F55A]" />
              </motion.div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#F0F0F0] mb-1">Quote Request Submitted!</h2>
                <p className="text-sm text-[#B0B0B8]">
                  Our dealer will review and provide a competitive firm quote shortly.
                </p>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-lg p-4 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#B0B0B8]">Amount</span>
                  <div className="flex items-center gap-2">
                    <Image
                      src={ASSET_CONFIG[tradeData.cryptoAsset].icon}
                      alt={tradeData.cryptoAsset}
                      width={16}
                      height={16}
                    />
                    <span className="text-[#F0F0F0] font-bold">
                      {tradeData.cryptoAmount} {tradeData.cryptoAsset}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#B0B0B8]">Network</span>
                  <div className="flex items-center gap-2">
                    <Image
                      src={NETWORK_CONFIG[tradeData.cryptoNetwork].icon}
                      alt={tradeData.cryptoNetwork}
                      width={14}
                      height={14}
                    />
                    <span className="text-sm text-[#F0F0F0]">
                      {CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#2D2D3D]">
                  <span className="text-sm text-[#B0B0B8]">Estimated Value</span>
                  <span className="text-[#C8F55A] font-bold text-lg">
                    ₦{estimatedNaira.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-3">
                <p className="text-xs text-[#B0B0B8]">
                  📧 You'll receive a notification when your quote is ready (typically 5-15 min during business hours).
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => (window.location.href = "/client/quotes")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
                >
                  View My Quotes
                </motion.button>
                <motion.button
                  onClick={() => {
                    setStep("select")
                    setTradeData({ ...tradeData, cryptoAmount: "" })
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
                >
                  New Request
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
