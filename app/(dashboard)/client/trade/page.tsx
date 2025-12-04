"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function TradeRequestPage() {
  const [step, setStep] = useState<"select" | "amount" | "review">("select")
  const [tradeData, setTradeData] = useState({
    from: "BTC",
    to: "NGN",
    amount: "",
  })

  const exchangeRates = {
    "BTC-NGN": 43500000,
    "ETH-NGN": 2850000,
    "USDT-NGN": 1565,
  }

  const handleGetRate = () => {
    if (tradeData.amount && Number.parseFloat(tradeData.amount) > 0) {
      setStep("review")
    }
  }

  const handleSubmit = () => {
    console.log("Trade request submitted:", tradeData)
    // In a real app, this would submit to the backend
  }

  const rateKey = `${tradeData.from}-${tradeData.to}` as keyof typeof exchangeRates
  const rate = exchangeRates[rateKey] || 0
  const receivedAmount = Number.parseFloat(tradeData.amount || "0") * rate

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Request New Quote" subtitle="Get live rates and submit your trade" />

      <div className="max-w-2xl mx-auto">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            {["Select", "Amount", "Review"].map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    (step === "select" && idx <= 0) ||
                    (step === "amount" && idx <= 1) ||
                    (step === "review" && idx <= 2)
                      ? "bg-[#C8F55A] text-[#1E1E2B]"
                      : "bg-[#2D2D3D] text-[#B0B0B8]"
                  }`}
                >
                  {idx + 1}
                </motion.div>
                <span
                  className={`text-sm font-medium ${
                    (step === "select" && idx <= 0) ||
                    (step === "amount" && idx <= 1) ||
                    (step === "review" && idx <= 2)
                      ? "text-[#F0F0F0]"
                      : "text-[#B0B0B8]"
                  }`}
                >
                  {label}
                </span>
                {idx < 2 && <div className="w-8 h-0.5 bg-[#2D2D3D]" />}
              </div>
            ))}
          </div>

          {/* Step 1: Select currencies */}
          {step === "select" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-[#F0F0F0]">Select Currency Pair</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Send</label>
                  <div className="space-y-2">
                    {["BTC", "ETH", "USDT"].map((coin) => (
                      <motion.button
                        key={coin}
                        onClick={() => setTradeData({ ...tradeData, from: coin })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                          tradeData.from === coin
                            ? "bg-[#641AE4] text-white"
                            : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                        }`}
                      >
                        {coin}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Receive</label>
                  <motion.button
                    onClick={() => setTradeData({ ...tradeData, to: "NGN" })}
                    className="w-full p-4 rounded-lg text-left font-medium bg-[#641AE4] text-white transition-all"
                  >
                    Nigerian Naira (NGN)
                  </motion.button>
                </div>
              </div>

              <motion.button
                onClick={() => setStep("amount")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Enter amount */}
          {step === "amount" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-[#F0F0F0]">Enter Amount</h2>

              <div className="p-4 bg-[#2D2D3D] rounded-lg border border-[#641AE4]/20">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Send {tradeData.from}</label>
                <input
                  type="number"
                  value={tradeData.amount}
                  onChange={(e) => setTradeData({ ...tradeData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-transparent text-4xl font-bold text-[#C8F55A] focus:outline-none"
                />
              </div>

              <div className="p-4 bg-[#1E1E2B]/60 rounded-lg border border-[#2D2D3D]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B0B0B8] text-sm">Rate</span>
                  <span className="text-[#F0F0F0] font-bold">
                    1 {tradeData.from} = ₦{rate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B0B0B8] text-sm">You'll Receive</span>
                  <span className="text-[#C8F55A] font-bold text-2xl">₦{receivedAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all"
                >
                  Back
                </button>
                <motion.button
                  onClick={handleGetRate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!tradeData.amount || Number.parseFloat(tradeData.amount) <= 0}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Get Rate
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-[#F0F0F0]">Review Trade</h2>

              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-[#2D2D3D] rounded-lg">
                  <span className="text-[#B0B0B8]">Sending</span>
                  <span className="text-[#F0F0F0] font-bold">
                    {tradeData.amount} {tradeData.from}
                  </span>
                </div>

                <div className="flex justify-between p-4 bg-[#2D2D3D] rounded-lg">
                  <span className="text-[#B0B0B8]">Receiving</span>
                  <span className="text-[#C8F55A] font-bold">₦{receivedAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between p-4 bg-[#2D2D3D] rounded-lg">
                  <span className="text-[#B0B0B8]">Exchange Rate</span>
                  <span className="text-[#F0F0F0] font-bold">1 = ₦{rate.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/20 rounded-lg">
                  <p className="text-[#C8F55A] text-sm font-medium">This quote is valid for 30 minutes</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all"
                >
                  Back
                </button>
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
                >
                  Submit Trade Request
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
