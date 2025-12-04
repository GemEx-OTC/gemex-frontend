"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { AlertCircle, Info, TrendingUp } from "lucide-react"

export default function TradeRequestPage() {
  const [step, setStep] = useState<"select" | "amount" | "submitted">("select")
  const [tradeData, setTradeData] = useState({
    cryptoAsset: "USDT" as keyof typeof CRYPTO_ASSETS,
    cryptoNetwork: "TRC20" as keyof typeof CRYPTO_NETWORKS,
    cryptoAmount: "",
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="Request Trade Quote"
        subtitle="Get a firm quote from our dealers for your crypto-to-Naira trade"
      />

      <div className="max-w-3xl mx-auto">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#B0B0B8]">
              <p className="font-medium text-[#F0F0F0] mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Submit your trade request with amount</li>
                <li>Our dealer will provide a <strong className="text-[#C8F55A]">firm quote rate</strong></li>
                <li>Accept the quote and send crypto to your unique deposit address</li>
                <li>Receive Naira payout to your verified bank account</li>
              </ol>
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
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#F0F0F0]">Select Crypto Asset</h2>

              {/* Crypto Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Cryptocurrency</label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(CRYPTO_ASSETS).map(([key, asset]) => (
                    <motion.button
                      key={key}
                      onClick={() => setTradeData({ ...tradeData, cryptoAsset: key as keyof typeof CRYPTO_ASSETS })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg text-center font-medium transition-all ${
                        tradeData.cryptoAsset === key
                          ? "bg-gradient-to-br from-[#641AE4] to-[#9A24D2] text-white"
                          : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]/80"
                      }`}
                    >
                      <div className="text-3xl mb-2">{asset.icon}</div>
                      <div className="font-bold">{asset.symbol}</div>
                      <div className="text-xs opacity-80">{asset.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Network</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(CRYPTO_NETWORKS)
                    .filter(([key]) => {
                      // Filter networks based on asset
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
                        className={`p-3 rounded-lg text-left transition-all ${
                          tradeData.cryptoNetwork === key
                            ? "bg-[#641AE4] text-white"
                            : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                        }`}
                      >
                        <div className="font-semibold">{network.name}</div>
                        <div className="text-xs opacity-80">{network.chain}</div>
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* System Rate Display */}
              <div className="bg-[#2D2D3D]/50 border border-[#641AE4]/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#641AE4]" />
                    <span className="text-[#B0B0B8]">Indicative System Rate</span>
                  </div>
                  <span className="text-[#F0F0F0] font-bold text-lg">
                    1 {tradeData.cryptoAsset} = ₦{systemRate.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#B0B0B8] mt-2">
                  * This is an estimate. Dealer will provide the final firm rate.
                </p>
              </div>

              <motion.button
                onClick={() => setStep("amount")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-[#F0F0F0]">Enter Amount</h2>

              {/* Amount Input */}
              <div className="bg-[#2D2D3D]/50 border-2 border-[#641AE4]/30 rounded-xl p-6">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-3">
                  Amount to Send ({tradeData.cryptoAsset})
                </label>
                <input
                  type="number"
                  step="any"
                  value={tradeData.cryptoAmount}
                  onChange={(e) => setTradeData({ ...tradeData, cryptoAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-transparent text-5xl font-bold text-[#C8F55A] focus:outline-none placeholder-[#2D2D3D]"
                />
                <div className="mt-4 pt-4 border-t border-[#2D2D3D]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#B0B0B8]">Estimated Naira (Indicative)</span>
                    <span className="text-[#F0F0F0] font-bold text-2xl">₦{estimatedNaira.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trade Details */}
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8]">Asset</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_ASSETS[tradeData.cryptoAsset].name} ({tradeData.cryptoAsset})
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8]">Network</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-[#2D2D3D]/30 rounded-lg">
                  <span className="text-[#B0B0B8]">System Rate</span>
                  <span className="text-[#F0F0F0] font-medium">₦{systemRate.toLocaleString()}</span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#C8F55A] font-medium mb-1">Important</p>
                    <p className="text-[#B0B0B8]">
                      The final rate will be set by our dealer. You'll receive a notification when your firm quote is
                      ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setStep("select")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={!tradeData.cryptoAmount || Number.parseFloat(tradeData.cryptoAmount) <= 0}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3.5 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Quote
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "submitted" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#C8F55A]/30 rounded-xl p-8 text-center space-y-6"
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
                <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Quote Request Submitted!</h2>
                <p className="text-[#B0B0B8]">
                  Our dealer will review your request and provide a firm quote shortly.
                </p>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-lg p-6 space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-[#B0B0B8]">Amount</span>
                  <span className="text-[#F0F0F0] font-bold">
                    {tradeData.cryptoAmount} {tradeData.cryptoAsset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0B8]">Network</span>
                  <span className="text-[#F0F0F0] font-medium">
                    {CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0B8]">Estimated Value</span>
                  <span className="text-[#C8F55A] font-bold">₦{estimatedNaira.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4">
                <p className="text-sm text-[#B0B0B8]">
                  📧 You'll receive an email and in-app notification when your quote is ready. Quotes are typically
                  generated within 5-10 minutes.
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => (window.location.href = "/client/dashboard")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-3.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/5 transition-all"
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
                  className="flex-1 py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
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
