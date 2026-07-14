"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, X, ChevronUp } from "lucide-react"
import Image from "next/image"

interface ExchangeRate {
  pair: string
  label: string
  fromAsset: string
  toAsset: string
  value: number
  symbol: string
  icon: string
  color: string
  bgGradient: string
}

interface FloatingRateDockProps {
  exchangeRates: {
    USDT_NGN: number
    USDC_NGN?: number
    BTC_USD: number
    USD_NGN: number
    BTC_NGN: number
    lastUpdated?: string
  }
}

export function FloatingRateDock({ exchangeRates }: FloatingRateDockProps) {
  const [isOpen, setIsOpen] = useState(false)

  const rates: ExchangeRate[] = [
    {
      pair: "USDT_NGN",
      label: "USDT → NGN",
      fromAsset: "USDT",
      toAsset: "NGN",
      value: exchangeRates.USDT_NGN,
      symbol: "₦",
      icon: "/icons/usdt.svg",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
      pair: "USDC_NGN",
      label: "USDC → NGN",
      fromAsset: "USDC",
      toAsset: "NGN",
      value: exchangeRates.USDC_NGN || exchangeRates.USDT_NGN,
      symbol: "₦",
      icon: "/icons/usdc.svg",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      pair: "BTC_NGN",
      label: "BTC → NGN",
      fromAsset: "BTC",
      toAsset: "NGN",
      value: exchangeRates.BTC_NGN,
      symbol: "₦",
      icon: "/icons/btc.svg",
      color: "text-orange-500",
      bgGradient: "from-orange-500/20 to-amber-500/10",
    },
  ]

  const formatValue = (value: number, pair: string) => {
    if (pair === "BTC_NGN") {
      return `${(value / 1000000).toFixed(2)}M`
    }
    return value.toLocaleString()
  }

  return (
    <>
      {/* Mobile: View Rates Button - Positioned above bottom nav */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed z-[60] flex items-center gap-2 px-4 py-2.5
              bg-gradient-to-r from-primary to-accent rounded-full
              text-white font-medium shadow-lg shadow-primary/30
              transition-all duration-300 border border-white/10
              bottom-20 right-4
              md:bottom-6 md:right-6 md:px-5 md:py-3"
          >
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Rates</span>
            <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Panel - Right Side */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[60] w-[340px] hidden md:block
              bg-card rounded-2xl border border-border
              shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between
              bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Live Rates</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Updated {exchangeRates.lastUpdated
                      ? new Date(exchangeRates.lastUpdated).toLocaleTimeString()
                      : "just now"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Rate Cards */}
            <div className="p-3 space-y-2">
              {rates.map((rate, idx) => (
                <motion.div
                  key={rate.pair}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${rate.bgGradient} 
                    border border-border/50 hover:border-border transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center">
                        <Image
                          src={rate.icon}
                          alt={rate.fromAsset}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{rate.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          1 {rate.fromAsset} = {rate.symbol}{formatValue(rate.value, rate.pair)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${rate.color}`}>
                        {rate.symbol}{formatValue(rate.value, rate.pair)}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-green-500">Live</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border bg-muted/30">
              <p className="text-[10px] text-center text-muted-foreground">
                Rates refresh automatically
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Full Screen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden bg-background flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-border flex items-center justify-between
              bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Live Exchange Rates</h3>
                  <p className="text-xs text-muted-foreground">
                    Updated {exchangeRates.lastUpdated
                      ? new Date(exchangeRates.lastUpdated).toLocaleTimeString()
                      : "just now"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Rate Cards - Full Width */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Current conversion rates for supported tokens
              </p>
              
              {rates.map((rate, idx) => (
                <motion.div
                  key={rate.pair}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${rate.bgGradient} 
                    border border-border/50`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl bg-white/10 p-2 flex items-center justify-center">
                        <Image
                          src={rate.icon}
                          alt={rate.fromAsset}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg">{rate.fromAsset}</p>
                        <p className="text-sm text-muted-foreground">{rate.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${rate.color}`}>
                        {rate.symbol}{formatValue(rate.value, rate.pair)}
                      </p>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-500">Live</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversion info */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground">
                      1 {rate.fromAsset} = <span className="text-foreground font-medium">{rate.symbol}{formatValue(rate.value, rate.pair)}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-border bg-muted/30">
              <p className="text-xs text-center text-muted-foreground mb-3">
                Rates refresh automatically • Powered by GemRails
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium
                  hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
