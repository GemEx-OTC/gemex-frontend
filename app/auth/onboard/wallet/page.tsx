"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import Link from "next/link"

export default function WalletVerificationPage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress || "Paste your wallet address")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = () => {
    // In a real app, this would connect to a Web3 wallet
    window.location.href = "/auth/onboard/pending"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8">
          <KycProgressBar currentStep={3} totalSteps={4} />

          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Wallet Verification</h1>
          <p className="text-[#B0B0B8] mb-8">
            Connect a withdrawal wallet to complete your setup. This ensures secure, non-custodial transactions.
          </p>

          <div className="space-y-6">
            <div className="p-6 bg-[#2D2D3D] rounded-lg border border-[#641AE4]/20">
              <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                className="w-full bg-[#1E1E2B] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none font-mono text-sm"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-sm rounded-lg font-medium text-[#F0F0F0] bg-[#641AE4] hover:bg-[#9A24D2] transition-all"
                >
                  {copied ? "✓ Copied" : "Copy Address"}
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#C8F55A]/5 border border-[#C8F55A]/20 rounded-lg">
              <p className="text-[#C8F55A] text-sm font-medium">✓ Wallet addresses are verified and secured</p>
              <p className="text-[#B0B0B8] text-xs mt-2">
                You can update your withdrawal wallet anytime in account settings.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/auth/onboard/document" className="flex-1">
                <button
                  type="button"
                  className="w-full py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all"
                >
                  Back
                </button>
              </Link>
              <button
                onClick={handleConnect}
                disabled={!walletAddress}
                className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
