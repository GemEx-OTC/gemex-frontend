"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { AlertCircle, Info, TrendingUp, ArrowRight, Check } from "lucide-react"

export default function TradeRequestPage() {
  const [step, setStep] = useState<"select" | "amount" | "submitted">("select")
  const [tradeData, setTradeData] = useState({
    cryptoAsset: "USDT" as keyof typeof CRYPTO_ASSETS,
    cryptoNetwork: "TRC20" as keyof typeof CRYPTO_NETWORKS,
    cryptoAmount: "50000",
  })

  // Mock system rates (indicative only - from Admin's PricingConfig)
  const systemRates = {
    USDT: 1565,
    BTC: 43500000,
    USDC: 1565,
  }

  const handleSubmitRequest = () => {
    console.log("Quote request submitted:", tradeData)
    // In production: POST /api/v1/quotes
    setStep("submitted")
  }

  const systemRate = systemRates[tradeData.cryptoAsset]
  const estimatedNaira = Number.parseFloat(tradeData.cryptoAmount || "0") * systemRate
  const minAmount = tradeData.cryptoAsset === "BTC" ? 0.01 : 50000

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="Request Bulk Trade Quote"
        subtitle="Get competitive rates for large crypto-to-Naira conversions"
      />

      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {["select", "amount", "submitted"].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === s
                    ? "bg-[#641AE4] text-white scale-110"
                    : idx < ["select", "amount", "submitted"].indexOf(step)
                    ? "bg-[#C8F55A] text-[#1E1E2B]"
                    : "bg-[#2D2D3D] text-[#B0B0B8]"
                }`}
              >
                {idx < ["select", "amount", "submitted"].indexOf(step) ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all ${
                    idx < ["select", "amount", "submitted"].indexOf(step) ? "bg-[#C8F55A]" : "bg-[#2D2D3D]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#B0B0B8]">
              <p className="font-medium text-[#F0F0F0] mb-2">Bulk Trade Process:</p>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-[#C8F55A]">1.</span>
                  <span>Submit your bulk trade request</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C8F55A]">2.</span>
                  <span>Dealer provides firm quote rate</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C8F55A]">3.</span>
                  <span>Accept & send crypto to deposit address</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C8F55A]">4.</span>
                  <span>Receive Naira to your bank account</span>
                </div>
              </div>
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
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Select Asset & Network</h2>
                <p className="text-sm text-[#B0B0B8]">Choose the cryptocurrency and network for your bulk trade</p>
              </div>

              {/* Crypto Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Cryptocurrency</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {Object.entries(CRYPTO_ASSETS).map(([key, asset]) => (
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
                      className={`p-4 md:p-6 rounded-xl text-center font-medium transition-all ${
                        tradeData.cryptoAsset === key
                          ? "bg-gradient-to-br from-[#641AE4] to-[#9A24D2] text-white shadow-lg shadow-[#641AE4]/30"
                          : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]/80 border border-[#2D2D3D]"
                      }`}
                    >
                      <div className="text-4xl md:text-5xl mb-2">{asset.icon}</div>
                      <div className="font-bold text-lg">{asset.symbol}</div>
                      <div className="text-xs opacity-80 mt-1">{asset.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Network</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CRYPTO_NETWORKS)
                    .filter(([key]) => {
                      if (tradeData.cryptoAsset === "BTC") return key === "BTC"
                      return key !== "BTC"
                    })
                    .map(([key, network]) => (
                      <motion.button
                        key={key}
                        onClick={() =>
                          setTradeData({ ...tradeData, cryptoNetwork: key as keyof typeof CRYPTO_NETWORKS })
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl text-left transition-all ${
                          tradeData.cryptoNetwork === key
                            ? "bg-[#641AE4] text-white shadow-lg"
                            : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0] border border-[#2D2D3D]"
                        }`}
                      >
                        <div className="font-semibold text-base">{network.name}</div>
                        <div className="text-xs opacity-80 mt-1">{network.chain}</div>
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* System Rate Display */}
              <div className="bg-gradient-to-br from-[#641AE4]/10 to-[#9A24D2]/5 border border-[#641AE4]/30 rounded-xl p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#641AE4]" />
                    <span className="text-[#B0B0B8] text-sm md:text-base">Indicative System Rate</span>
                  </div>
                  <span className="text-[#F0F0F0] font-bold text-xl md:text-2xl">
                    1 {tradeData.cryptoAsset} = ₦{systemRate.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#B0B0B8] mt-3">
                  * This is an estimate. Dealer will provide the final firm rate for your bulk trade.
                </p>
              </div>

              <motion.button
                onClick={() => setStep("amount")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2"
              >
                Continue to Amount
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Enter Trade Amount</h2>
                <p className="text-sm text-[#B0B0B8]">Specify how much {tradeData.cryptoAsset} you want to trade</p>
              </div>

              {/* Amount Input */}
              <div className="bg-gradient-to-br from-[#2D2D3D]/80 to-[#2D2D3D]/40 border-2 border-[#641AE4]/30 rounded-xl p-6 md:p-8">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-3">
                  Amount to Send ({tradeData.cryptoAsset})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={tradeData.cryptoAmount}
                    onChange={(e) => setTradeData({ ...tradeData, cryptoAmount: e.target.value })}
                    placeholder="0.00"
                    min={50000}
                    className="w-full bg-transparent text-4xl md:text-5xl lg:text-6xl font-bold text-[#C8F55A] focus:outline-none placeholder-[#2D2D3D]"
                  />
                </div>
                <p className="text-xs text-[#B0B0B8] mt-2">
                  Minimum: {minAmount.toLocaleString()} {tradeData.cryptoAsset}
                </p>
                
                <div className="mt-6 pt-6 border-t border-[#2D2D3D]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-[#B0B0B8] text-sm md:text-base">Estimated Naira (Indicative)</span>
                    <span className="text-[#F0F0F0] font-bold text-2xl md:text-3xl">
                      ₦{estimatedNaira.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trade Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8] text-sm">Asset</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_ASSETS[tradeData.cryptoAsset].name} ({tradeData.cryptoAsset})
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8] text-sm">Network</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8] text-sm">System Rate</span>
                  <span className="text-[#F0F0F0] font-medium">₦{systemRate.toLocaleString()}</span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#C8F55A] font-medium mb-1">Important</p>
                    <p className="text-[#B0B0B8]">
                      The final rate will be set by our dealer based on current market conditions. You'll receive a notification when your firm quote is ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => setStep("select")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="sm:flex-1 py-4 rounded-xl font-semibold text-[#F0F0F0] border-2 border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={!tradeData.cryptoAmount || Number.parseFloat(tradeData.cryptoAmount) < minAmount}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="sm:flex-1 py-4 rounded-xl font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Request Bulk Quote
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#C8F55A]/30 rounded-xl p-6 md:p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#C8F55A]/20 mb-4"
              >
                <div className="text-[#C8F55A] text-4xl">✓</div>
              </motion.div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#F0F0F0] mb-2">Quote Request Submitted!</h2>
                <p className="text-[#B0B0B8]">
                  Our dealer will review your bulk trade request and provide a competitive firm quote shortly.
                </p>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-xl p-6 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[#B0B0B8]">Amount</span>
                  <span className="text-[#F0F0F0] font-bold text-lg">
                    {tradeData.cryptoAmount} {tradeData.cryptoAsset}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B0B0B8]">Network</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#2D2D3D]">
                  <span className="text-[#B0B0B8]">Estimated Value</span>
                  <span className="text-[#C8F55A] font-bold text-xl">
                    ₦{estimatedNaira.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-xl p-4">
                <p className="text-sm text-[#B0B0B8]">
                  📧 You'll receive an email and in-app notification when your quote is ready. Bulk trade quotes are typically generated within 5-15 minutes during business hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => (window.location.href = "/client/dashboard")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="sm:flex-1 py-4 rounded-xl font-semibold text-[#F0F0F0] border-2 border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
                >
                  Go to Dashboard
                </motion.button>
                <motion.button
                  onClick={() => {
                    setStep("select")
                    setTradeData({ ...tradeData, cryptoAmount: "" })
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="sm:flex-1 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
                >
                  Request Another Quote
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
