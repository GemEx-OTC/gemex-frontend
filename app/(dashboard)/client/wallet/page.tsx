"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function WalletPage() {
  const [copied, setCopied] = useState(false)
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f64c31"

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Deposit Wallet" subtitle="Your unique wallet address for receiving funds" />

      <div className="max-w-2xl">
        <div className="p-8 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Your Wallet Address</h2>

          <div className="p-6 bg-[#2D2D3D] rounded-lg mb-6 font-mono text-sm">
            <p className="text-[#F0F0F0] break-all">{walletAddress}</p>
          </div>

          <div className="flex gap-4 mb-6">
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
            >
              {copied ? "✓ Copied" : "Copy Address"}
            </motion.button>
          </div>

          <div className="space-y-4 text-sm text-[#B0B0B8]">
            <div className="p-4 bg-[#1E1E2B]/60 rounded-lg">
              <p className="font-semibold text-[#F0F0F0] mb-2">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only send cryptocurrencies to this address</li>
                <li>Do not send fiat currency to this address</li>
                <li>Your deposits appear instantly upon network confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
