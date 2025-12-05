"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import { Wallet, Copy, Check } from "lucide-react"

export default function WalletVerificationPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [walletType, setWalletType] = useState<"TRC20" | "BSC" | "ERC20" | "BTC">("TRC20")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateAddress = () => {
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address or skip this step")
      return false
    }

    // Basic validation based on network type
    if ((walletType === "ERC20" || walletType === "BSC") && !walletAddress.startsWith("0x")) {
      setError("ERC20/BSC addresses must start with 0x")
      return false
    }

    if (walletType === "TRC20" && !walletAddress.startsWith("T")) {
      setError("TRC20 addresses must start with T")
      return false
    }

    if (walletType === "BTC" && !walletAddress.match(/^(bc1|[13])/)) {
      setError("Invalid Bitcoin address format")
      return false
    }

    if (walletAddress.length < 26) {
      setError("Please enter a valid wallet address")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (walletAddress && !validateAddress()) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      router.push("/auth/onboard/pending")
    }, 1000)
  }

  const handleSkip = () => {
    router.push("/auth/onboard/pending")
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <KycProgressBar currentStep={3} totalSteps={4} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 mt-8"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#641AE4] to-[#9A24D2] mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Wallet Setup</h1>
            <p className="text-[#B0B0B8]">
              Add a wallet address for receiving funds. This is optional and can be added later from settings.
            </p>
          </div>

          {/* Network Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Select Network</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "TRC20", label: "Tron (TRC20)", desc: "USDT", color: "from-[#FF0013]/20" },
                { value: "BSC", label: "BNB Chain", desc: "USDT, USDC", color: "from-[#F3BA2F]/20" },
                { value: "ERC20", label: "Ethereum", desc: "USDT, USDC", color: "from-[#627EEA]/20" },
                { value: "BTC", label: "Bitcoin", desc: "BTC", color: "from-[#F7931A]/20" },
              ].map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setWalletType(type.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    walletType === type.value
                      ? "border-[#C8F55A] bg-gradient-to-br " + type.color + " to-transparent"
                      : "border-[#2D2D3D] bg-[#2D2D3D]/50 hover:border-[#641AE4]/40"
                  }`}
                >
                  <div className="font-semibold text-[#F0F0F0] mb-1">{type.label}</div>
                  <div className="text-xs text-[#B0B0B8]">{type.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wallet Address Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Wallet Address</label>
            <div className="relative">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value)
                  setError("")
                }}
                placeholder={
                  walletType === "TRC20"
                    ? "TXYZa1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5"
                    : walletType === "BTC"
                    ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                    : "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                }
                className={`w-full bg-[#2D2D3D] border-b-2 ${
                  error ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                } text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 pr-12 rounded transition-all focus:outline-none font-mono text-sm`}
              />
              {walletAddress && (
                <button
                  onClick={async () => {
                    const { copyToClipboard } = await import("@/lib/clipboard")
                    await copyToClipboard(walletAddress)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[#641AE4]/20 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#641AE4]" />
                </button>
              )}
            </div>
            {error && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-sm mt-2">
                {error}
              </motion.p>
            )}
          </div>

          {/* Info Boxes */}
          <div className="space-y-4 mb-8">
            <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-4">
              <p className="text-sm text-[#C8F55A] font-medium mb-2">✓ Why add a wallet now?</p>
              <ul className="text-sm text-[#F0F0F0] space-y-1 ml-4">
                <li>• Faster transactions when you're ready to trade</li>
                <li>• One less step when making your first transaction</li>
                <li>• Enhanced security with pre-verified addresses</li>
              </ul>
            </div>

            <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4">
              <p className="text-sm text-[#F0F0F0]">
                <strong>Security Note:</strong> Make sure you control this wallet address. We'll verify ownership before processing transactions.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Continue"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSkip}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
            >
              Skip for Now
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
            >
              Back
            </motion.button>
          </div>

          {/* Skip Notice */}
          <p className="text-center text-sm text-[#B0B0B8] mt-6">
            You can add or update your wallet address anytime from your account settings
          </p>
        </motion.div>
      </div>
    </div>
  )
}
