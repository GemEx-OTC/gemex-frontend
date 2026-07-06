"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_ASSETS, CRYPTO_NETWORKS } from "@/lib/constants"
import { AlertCircle, Info, ArrowRight, Check, Loader2 } from "lucide-react"
import { createQuote } from "@/lib/api/quotes"
import { getExchangeRates } from "@/lib/api/settings"
import { useUserSettingsProfile } from "@/lib/hooks/use-user-settings"
import { 
  NetworkEthereum, 
  NetworkBinanceSmartChain, 
  NetworkBase, 
  NetworkPolygon, 
  NetworkArbitrumOne, 
  NetworkOptimism,
  NetworkTron,
  NetworkBitcoin,
  TokenUSDT,
  TokenUSDC,
  TokenBTC
} from "@web3icons/react"

type AssetKey = keyof typeof CRYPTO_ASSETS
type NetworkKey = keyof typeof CRYPTO_NETWORKS

// Helper to render network icons from @web3icons/react
function NetworkIconComponent({ network, size = 24 }: { network: NetworkKey; size?: number }) {
  switch (network) {
    case "TRC20":
      return <NetworkTron size={size} variant="branded" />
    case "BSC":
      return <NetworkBinanceSmartChain size={size} variant="branded" />
    case "BASE":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="web3icons flex-shrink-0" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#0052FF" />
          <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
        </svg>
      )
    case "ETH":
      return <NetworkEthereum size={size} variant="branded" />
    case "POLYGON":
      return <NetworkPolygon size={size} variant="branded" />
    case "ARBITRUM":
      return <NetworkArbitrumOne size={size} variant="branded" />
    case "OPTIMISM":
      return <NetworkOptimism size={size} variant="branded" />
    case "BTC":
      return <NetworkBitcoin size={size} variant="branded" />
    default:
      return null
  }
}

// Helper to render asset icons from @web3icons/react
function TokenIconComponent({ asset, size = 24 }: { asset: AssetKey; size?: number }) {
  switch (asset) {
    case "USDT":
      return <TokenUSDT size={size} variant="branded" />
    case "USDC":
      return <TokenUSDC size={size} variant="branded" />
    case "BTC":
      return <TokenBTC size={size} variant="branded" />
    default:
      return null
  }
}

export default function TradeRequestPage() {
  const { data: profile } = useUserSettingsProfile()
  const userTier = profile?.tier || 1
  
  const [step, setStep] = useState<"select" | "amount" | "submitted">("select")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tradeData, setTradeData] = useState({
    cryptoAsset: "USDT" as AssetKey,
    cryptoNetwork: "BSC" as NetworkKey,
    cryptoAmount: "50000",
  })
  const [systemRates, setSystemRates] = useState({
    USDT: 0,
    BTC: 0,
    USDC: 0,
  })

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const rates = await getExchangeRates()
        setSystemRates({
          USDT: rates.USDT_NGN,
          BTC: rates.BTC_NGN,
          USDC: rates.USDC_NGN,
        })
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err)
      }
    }
    fetchRates()
  }, [])

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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === s
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
                  className={`w-10 md:w-16 h-0.5 mx-2 rounded-full transition-all ${idx < steps.indexOf(step) ? "bg-[#C8F55A]" : "bg-[#2D2D3D]"
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
          className="mb-5 bg-slate-800/60 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#CBD5E1]">
              <span className="font-semibold text-white">Process: </span>
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
              className="bg-[#1C1C28] border border-[#2D2D42] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-[#F8F9FA] mb-2">Select Asset & Network</h2>
                <p className="text-base text-[#CBD5E1]">Choose the cryptocurrency and network for your bulk trade</p>
              </div>

              {userTier < 3 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-500 mb-1">Tier 3 Verification Required</h3>
                      <p className="text-xs text-[#B0B0B8]">
                        Bulk quotes require Business (CAC) Verification. Please <a href="/client/settings" className="text-[#641AE4] underline">upgrade your account</a> in the settings to proceed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto Asset Selection - Compact */}
              <div>
                <label className="block text-base font-bold text-[#F8F9FA] mb-3">Cryptocurrency</label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(CRYPTO_ASSETS)
                    .filter(([key]) => key !== "BTC")
                    .map(([key, asset]) => {
                      const isSelected = tradeData.cryptoAsset === key
                      return (
                        <motion.button
                          key={key}
                          onClick={() => {
                            setTradeData({
                              ...tradeData,
                              cryptoAsset: key as AssetKey,
                              cryptoNetwork: "TRC20"
                            })
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-5 rounded-xl text-center transition-all ${isSelected
                            ? "bg-[#24243D] border-2 border-[#C8F55A] text-white shadow-xl shadow-black/30"
                            : "bg-[#12121A] text-[#CBD5E1] hover:text-white hover:bg-[#242438]/60 border border-[#2D2D42]"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#1A1A24] border border-[#2D2D42]">
                              <TokenIconComponent asset={key as AssetKey} size={28} />
                            </div>
                            <div>
                              <div className={`font-extrabold text-lg md:text-xl ${isSelected ? "text-[#C8F55A]" : "text-white"}`}>{asset.symbol}</div>
                              <div className="text-xs md:text-sm text-[#cbd5e1] font-medium mt-0.5">{asset.name}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div
                              layoutId="asset-check"
                              className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8F55A] rounded-full flex items-center justify-center animate-pulse"
                            >
                              <Check className="w-3 h-3 text-[#1E1E2B]" />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                </div>
              </div>

              {/* Network Selection */}
              <div>
                <label className="block text-base font-bold text-[#F8F9FA] mb-3">Network</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CRYPTO_NETWORKS)
                    .filter(([key]) => {
                      if (tradeData.cryptoAsset === "BTC") return key === "BTC"
                      return key !== "BTC"
                    })
                    .map(([key, network]) => {
                      const isSelected = tradeData.cryptoNetwork === key
                      return (
                        <motion.button
                          key={key}
                          onClick={() =>
                            setTradeData({ ...tradeData, cryptoNetwork: key as NetworkKey })
                          }
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`relative p-4 rounded-xl text-left transition-all flex items-center gap-3 ${isSelected
                            ? "bg-[#24243D] border-2 border-[#C8F55A] text-white shadow-md"
                            : "bg-[#12121A] text-[#cbd5e1] hover:text-white hover:bg-[#242438]/60 border border-[#2D2D42]"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1A1A24] border border-[#2D2D42]">
                            <NetworkIconComponent network={key as NetworkKey} size={22} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-white truncate">{network.name}</div>
                            <div className="text-xs text-[#cbd5e1] font-medium mt-0.5">{network.chain}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 ml-auto flex-shrink-0 text-[#C8F55A] font-bold" />
                          )}
                        </motion.button>
                      )
                    })}
                </div>
              </div>

              <motion.button
                onClick={() => setStep("amount")}
                disabled={userTier < 3}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Continue
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
              className="bg-[#1C1C28] border border-[#2D2D42] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-[#F8F9FA] mb-2">Enter Trade Amount</h2>
                <p className="text-base text-[#CBD5E1]">Specify how much {tradeData.cryptoAsset} you want to trade</p>
              </div>

              {/* Selected Asset/Network Summary */}
              <div className="flex items-center gap-4 p-4 bg-[#12121A] border border-[#2D2D42] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2D2D42]">
                    <TokenIconComponent asset={tradeData.cryptoAsset} size={24} />
                  </div>
                  <span className="font-bold text-base text-white">{tradeData.cryptoAsset}</span>
                </div>
                <span className="text-[#CBD5E1] text-sm">on</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A24] flex items-center justify-center border border-[#2D2D42]">
                    <NetworkIconComponent network={tradeData.cryptoNetwork} size={18} />
                  </div>
                  <span className="text-sm font-semibold text-[#CBD5E1]">{CRYPTO_NETWORKS[tradeData.cryptoNetwork].name}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-[#12121A] border border-[#2D2D42] rounded-xl p-6 shadow-inner">
                <label className="block text-base font-bold text-[#cbd5e1] mb-3">
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
                    className="w-full bg-transparent border-none focus:ring-0 text-4xl md:text-5xl font-extrabold text-[#C8F55A] focus:outline-none placeholder-zinc-800"
                  />
                </div>
                <p className="text-sm font-medium text-[#cbd5e1] mt-2">
                  Min: {minAmount.toLocaleString()} {tradeData.cryptoAsset}
                </p>

                <div className="mt-6 pt-5 border-t border-[#2D2D42]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#cbd5e1] text-base font-semibold">Estimated Naira</span>
                    <span className="text-white font-extrabold text-2xl md:text-3xl">
                      ₦{estimatedNaira.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p className="text-sm text-[#cbd5e1] font-medium mt-2">
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
                    <TokenIconComponent asset={tradeData.cryptoAsset} size={16} />
                    <span className="text-[#F0F0F0] font-bold">
                      {tradeData.cryptoAmount} {tradeData.cryptoAsset}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#B0B0B8]">Network</span>
                  <div className="flex items-center gap-2">
                    <NetworkIconComponent network={tradeData.cryptoNetwork} size={14} />
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
