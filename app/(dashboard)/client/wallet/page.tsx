"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_NETWORKS } from "@/lib/constants"
import { Copy, Check, AlertCircle, Info } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"

// Mock wallet addresses - in production, these would come from the backend
const WALLET_ADDRESSES = {
  TRC20: "TXYZa1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5",
  BSC: "0x742d35Cc6634C0532925a3b844Bc9e7595f64c31",
  ERC20: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
} as const

type NetworkKey = keyof typeof WALLET_ADDRESSES

const NETWORK_INFO = {
  TRC20: {
    assets: ["USDT"],
    confirmations: "1 confirmation",
    avgTime: "~1 minute",
    fees: "Very Low",
    color: "from-[#FF0013]/20 to-[#FF0013]/5",
    borderColor: "border-[#FF0013]/40",
  },
  BSC: {
    assets: ["USDT", "USDC"],
    confirmations: "15 confirmations",
    avgTime: "~3 minutes",
    fees: "Low",
    color: "from-[#F3BA2F]/20 to-[#F3BA2F]/5",
    borderColor: "border-[#F3BA2F]/40",
  },
  ERC20: {
    assets: ["USDT", "USDC"],
    confirmations: "12 confirmations",
    avgTime: "~3 minutes",
    fees: "Medium",
    color: "from-[#627EEA]/20 to-[#627EEA]/5",
    borderColor: "border-[#627EEA]/40",
  },
  BTC: {
    assets: ["BTC"],
    confirmations: "2 confirmations",
    avgTime: "~20 minutes",
    fees: "Variable",
    color: "from-[#F7931A]/20 to-[#F7931A]/5",
    borderColor: "border-[#F7931A]/40",
  },
} as const

export default function WalletPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>("TRC20")
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopy = async (address: string, network: NetworkKey) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(network)
      setTimeout(() => setCopiedAddress(null), 2000)
    } else {
      // Show error feedback if copy fails
      alert("Failed to copy address. Please copy manually.")
    }
  }

  const currentAddress = WALLET_ADDRESSES[selectedNetwork]
  const currentInfo = NETWORK_INFO[selectedNetwork]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Deposit Wallets" 
        subtitle="Your unique wallet addresses for receiving crypto deposits" 
      />

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-[#F0F0F0] font-semibold mb-1">Select the correct network</p>
          <p className="text-[#B0B0B8]">
            Always verify the network matches your withdrawal platform. Sending to the wrong network may result in permanent loss of funds.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Network Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-[#B0B0B8] mb-3 uppercase tracking-wide">Select Network</h3>
          <div className="space-y-2">
            {(Object.keys(WALLET_ADDRESSES) as NetworkKey[]).map((network, index) => (
              <motion.button
                key={network}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedNetwork(network)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedNetwork === network
                    ? "bg-gradient-to-br " + NETWORK_INFO[network].color + " " + NETWORK_INFO[network].borderColor + " shadow-lg"
                    : "bg-[#2D2D3D] border-[#2D2D3D] hover:border-[#641AE4]/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#F0F0F0]">{CRYPTO_NETWORKS[network].name}</span>
                  {selectedNetwork === network && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-[#C8F55A] flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-[#1E1E2B]" />
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {NETWORK_INFO[network].assets.map((asset) => (
                    <span
                      key={asset}
                      className="px-2 py-0.5 text-xs rounded bg-[#1E1E2B]/60 text-[#B0B0B8]"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Wallet Address Display */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-[#B0B0B8] mb-3 uppercase tracking-wide">
            {CRYPTO_NETWORKS[selectedNetwork].name} Address
          </h3>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNetwork}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`p-6 bg-gradient-to-br ${currentInfo.color} border-2 ${currentInfo.borderColor} rounded-xl`}
            >
              {/* Address */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-[#B0B0B8] mb-2 block uppercase tracking-wide">
                  Wallet Address
                </label>
                <div className="p-4 bg-[#1E1E2B] rounded-lg font-mono text-sm break-all text-[#F0F0F0] mb-3">
                  {currentAddress}
                </div>
                <motion.button
                  onClick={() => handleCopy(currentAddress, selectedNetwork)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {copiedAddress === selectedNetwork ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </>
                  )}
                </motion.button>
              </div>

              {/* Network Details */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8] mb-1">Supported Assets</p>
                  <p className="text-sm font-semibold text-[#F0F0F0]">
                    {currentInfo.assets.join(", ")}
                  </p>
                </div>
                <div className="p-3 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8] mb-1">Confirmations Required</p>
                  <p className="text-sm font-semibold text-[#F0F0F0]">{currentInfo.confirmations}</p>
                </div>
                <div className="p-3 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8] mb-1">Average Time</p>
                  <p className="text-sm font-semibold text-[#F0F0F0]">{currentInfo.avgTime}</p>
                </div>
                <div className="p-3 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8] mb-1">Network Fees</p>
                  <p className="text-sm font-semibold text-[#F0F0F0]">{currentInfo.fees}</p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-[#1E1E2B]/60 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#641AE4] flex-shrink-0 mt-0.5" />
                  <p className="font-semibold text-[#F0F0F0] text-sm">Important Notes</p>
                </div>
                <ul className="space-y-1.5 text-sm text-[#B0B0B8] ml-6">
                  <li className="list-disc">Only send {currentInfo.assets.join(" or ")} on the {CRYPTO_NETWORKS[selectedNetwork].name}</li>
                  <li className="list-disc">Minimum deposit: Check current limits in your dashboard</li>
                  <li className="list-disc">Deposits are credited after {currentInfo.confirmations}</li>
                  <li className="list-disc">Do not send NFTs or other tokens to this address</li>
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-5 bg-[#2D2D3D] border border-[#2D2D3D] rounded-lg"
          >
            <h4 className="font-semibold text-[#F0F0F0] mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#641AE4]" />
              How Deposits Work
            </h4>
            <ol className="space-y-2 text-sm text-[#B0B0B8]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#641AE4]/20 text-[#641AE4] flex items-center justify-center text-xs font-bold">1</span>
                <span>Copy the wallet address for your chosen network</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#641AE4]/20 text-[#641AE4] flex items-center justify-center text-xs font-bold">2</span>
                <span>Send crypto from your external wallet or exchange</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#641AE4]/20 text-[#641AE4] flex items-center justify-center text-xs font-bold">3</span>
                <span>Wait for blockchain confirmations (automatic)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C8F55A]/20 text-[#C8F55A] flex items-center justify-center text-xs font-bold">4</span>
                <span>Your balance updates and you can proceed with trading</span>
              </li>
            </ol>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
