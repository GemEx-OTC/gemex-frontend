"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Copy, Check, AlertCircle, Info, Loader2, Wallet } from "lucide-react"
import Image from "next/image"
import { copyToClipboard } from "@/lib/clipboard"
import { useMyWallets } from "@/lib/hooks/use-wallets"

type NetworkKey = "TRC20" | "BSC" | "BTC"

const NETWORK_INFO: Record<NetworkKey, { name: string; chain: string; assets: string[]; logo: string }> = {
  TRC20: { name: "TRC20", chain: "Tron", assets: ["USDT"], logo: "/icons/chains/tron.svg" },
  BSC: { name: "BEP20", chain: "BNB Smart Chain", assets: ["USDT", "USDC"], logo: "/icons/chains/bnb.svg" },
  BTC: { name: "Bitcoin", chain: "Bitcoin", assets: ["BTC"], logo: "/icons/btc.svg" },
}

const ASSET_ICONS: Record<string, string> = {
  USDT: "/icons/usdt.svg",
  USDC: "/icons/usdc.svg",
  BTC: "/icons/btc.svg",
}

export default function AdminWalletPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { data: walletsData, isLoading, error } = useMyWallets()

  const handleCopy = async (address: string, network: string) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(network)
      setTimeout(() => setCopiedAddress(null), 2000)
    }
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DashboardHeader title="Admin Wallet" subtitle="Your deposit addresses for receiving crypto" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading wallet addresses...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DashboardHeader title="Admin Wallet" subtitle="Your deposit addresses for receiving crypto" />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Failed to Load Wallets</h3>
          <p className="text-muted-foreground mb-4">There was an error loading your wallet addresses.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  const wallets = walletsData?.wallets || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Admin Wallet" subtitle="Your deposit addresses for receiving crypto" />

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8 p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Admin Deposit Addresses</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            These are your unique wallet addresses for receiving crypto deposits. Use the correct network when sending funds.
          </p>
        </div>
      </motion.div>

      {/* Wallet Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(NETWORK_INFO) as NetworkKey[]).map((network, index) => {
          const info = NETWORK_INFO[network]
          const wallet = wallets.find(w => w.network === network)
          const address = wallet?.address || ""
          const hasAddress = !!address

          return (
            <motion.div
              key={network}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                hasAddress 
                  ? "bg-card border-border hover:border-primary/40 hover:shadow-lg" 
                  : "bg-card/50 border-border/50 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3">
                  <Image src={info.logo} alt={info.name} width={32} height={32} className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">{info.name}</h3>
                  <p className="text-sm text-muted-foreground">{info.chain}</p>
                </div>
              </div>

              {/* Supported Assets */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Supports:</span>
                <div className="flex items-center gap-1">
                  {info.assets.map(asset => (
                    <div key={asset} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <Image src={ASSET_ICONS[asset]} alt={asset} width={14} height={14} className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium text-foreground">{asset}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              {hasAddress ? (
                <>
                  <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all text-foreground mb-4 border border-border">
                    {address}
                  </div>
                  <motion.button
                    onClick={() => handleCopy(address, network)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    {copiedAddress === network ? (
                      <><Check className="w-4 h-4" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy Address</>
                    )}
                  </motion.button>
                </>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Address not available</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Warning */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.4 }}
        className="mt-8 p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important</h4>
            <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
              <li>• Always verify the network matches your source wallet</li>
              <li>• Sending to the wrong network may result in permanent loss</li>
              <li>• Double-check the address before confirming any transaction</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
