"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_NETWORKS, CRYPTO_ASSETS } from "@/lib/constants"
import { Copy, Check, AlertCircle, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"

// Mock wallet addresses - in production, these would come from the backend
const WALLET_ADDRESSES = {
  TRC20: "TXYZa1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5",
  BSC: "0x742d35Cc6634C0532925a3b844Bc9e7595f64c31",
  ERC20: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
} as const

type NetworkKey = keyof typeof WALLET_ADDRESSES
type AssetKey = keyof typeof CRYPTO_ASSETS

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

// Helper function to get networks that support a specific asset
const getNetworksForAsset = (asset: AssetKey): NetworkKey[] => {
  return (Object.keys(NETWORK_INFO) as NetworkKey[]).filter(network =>
    NETWORK_INFO[network].assets.includes(asset)
  )
}

export default function WalletPage() {
  // Mobile wizard state
  const [currentStep, setCurrentStep] = useState(1)
  
  // Shared state for both layouts
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>("USDT")
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Get available networks for the selected asset
  const availableNetworks = getNetworksForAsset(selectedAsset)
  
  // Auto-select first available network when asset changes (desktop)
  const currentNetwork = selectedNetwork && availableNetworks.includes(selectedNetwork) 
    ? selectedNetwork 
    : availableNetworks[0]

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

  // Desktop handlers
  const handleAssetChange = (asset: AssetKey) => {
    setSelectedAsset(asset)
    setSelectedNetwork(null)
  }

  // Mobile wizard handlers
  const handleAssetSelect = (asset: AssetKey) => {
    setSelectedAsset(asset)
    setSelectedNetwork(null)
    setCurrentStep(2)
  }

  const handleNetworkSelect = (network: NetworkKey) => {
    setSelectedNetwork(network)
    setCurrentStep(3)
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
      setSelectedNetwork(null)
    }
  }

  const currentAddress = (selectedNetwork || currentNetwork) ? WALLET_ADDRESSES[selectedNetwork || currentNetwork] : ""
  const currentInfo = (selectedNetwork || currentNetwork) ? NETWORK_INFO[selectedNetwork || currentNetwork] : null

  const steps = [
    { number: 1, title: "Choose Asset", description: "Select crypto to deposit" },
    { number: 2, title: "Pick Network", description: "Choose blockchain network" },
    { number: 3, title: "Get Address", description: "Copy deposit address" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Deposit Wallets" 
        subtitle="Your unique wallet addresses for receiving crypto deposits" 
      />

      {/* Mobile Multi-Step Wizard (hidden on lg+) */}
      <div className="lg:hidden">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center max-w-md">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep >= step.number
                          ? "bg-[#C8F55A] text-[#1E1E2B]"
                          : "bg-[#2D2D3D] text-[#B0B0B8] border-2 border-[#2D2D3D]"
                      }`}
                      animate={{
                        scale: currentStep === step.number ? 1.1 : 1,
                      }}
                    >
                      {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                    </motion.div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-semibold text-[#F0F0F0] hidden sm:block">{step.title}</p>
                      <p className="text-xs text-[#B0B0B8] hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 sm:w-20 h-0.5 mx-2 sm:mx-4 bg-[#2D2D3D] relative">
                      <motion.div
                        className="h-full bg-[#C8F55A]"
                        initial={{ width: "0%" }}
                        animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Step Title */}
          <div className="sm:hidden text-center">
            <h3 className="text-lg font-semibold text-[#F0F0F0]">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-[#B0B0B8]">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Navigation Header for Mobile */}
        {currentStep > 1 && (
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={handleBack}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D2D3D] text-[#F0F0F0] font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </motion.button>
            <div className="text-sm text-[#B0B0B8]">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        )}

        {/* Mobile Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Asset Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="mb-4 p-4 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#F0F0F0] font-semibold mb-1">Choose your crypto asset</p>
                    <p className="text-[#B0B0B8]">
                      Select the cryptocurrency you want to deposit to your wallet.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map((asset, index) => (
                    <motion.button
                      key={asset}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAssetSelect(asset)}
                      className="p-6 rounded-xl border-2 border-[#2D2D3D] bg-[#2D2D3D] hover:border-[#641AE4]/40 hover:bg-[#641AE4]/10 transition-all text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-4xl">{CRYPTO_ASSETS[asset].icon}</span>
                        <div>
                          <h3 className="font-bold text-[#F0F0F0] text-lg">{CRYPTO_ASSETS[asset].symbol}</h3>
                          <p className="text-sm text-[#B0B0B8]">{CRYPTO_ASSETS[asset].name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#B0B0B8]">
                          {getNetworksForAsset(asset).length} network{getNetworksForAsset(asset).length !== 1 ? 's' : ''}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#B0B0B8] group-hover:text-[#641AE4] transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Network Selection */}
            {currentStep === 2 && selectedAsset && (
              <div className="space-y-4">
                <div className="mb-4 p-4 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#F0F0F0] font-semibold mb-1">Select network for {selectedAsset}</p>
                    <p className="text-[#B0B0B8]">
                      Choose the blockchain network that matches your withdrawal platform.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {availableNetworks.map((network, index) => (
                    <motion.button
                      key={network}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNetworkSelect(network)}
                      className={`w-full p-5 rounded-xl border-2 transition-all text-left group ${
                        "bg-gradient-to-br " + NETWORK_INFO[network].color + " " + NETWORK_INFO[network].borderColor
                      } hover:shadow-lg`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#F0F0F0] text-lg">{CRYPTO_NETWORKS[network].name}</h3>
                        <ChevronRight className="w-5 h-5 text-[#B0B0B8] group-hover:text-[#F0F0F0] transition-colors" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#B0B0B8] mb-1">Network Fees</p>
                          <p className="font-semibold text-[#F0F0F0]">{NETWORK_INFO[network].fees}</p>
                        </div>
                        <div>
                          <p className="text-[#B0B0B8] mb-1">Average Time</p>
                          <p className="font-semibold text-[#F0F0F0]">{NETWORK_INFO[network].avgTime}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Address Display */}
            {currentStep === 3 && selectedAsset && selectedNetwork && currentInfo && (
              <div className="space-y-6">
                <div className="mb-4 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#F0F0F0] font-semibold mb-1">Your deposit address is ready!</p>
                    <p className="text-[#B0B0B8]">
                      Copy this address to receive {selectedAsset} on {CRYPTO_NETWORKS[selectedNetwork].name}.
                    </p>
                  </div>
                </div>

                {/* Address Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 bg-gradient-to-br ${currentInfo.color} border-2 ${currentInfo.borderColor} rounded-xl`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{CRYPTO_ASSETS[selectedAsset].icon}</span>
                    <div>
                      <h3 className="font-bold text-[#F0F0F0] text-xl">{selectedAsset}</h3>
                      <p className="text-sm text-[#B0B0B8]">{CRYPTO_NETWORKS[selectedNetwork].name}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-semibold text-[#B0B0B8] mb-2 block uppercase tracking-wide">
                      Deposit Address
                    </label>
                    <div className="p-4 bg-[#1E1E2B] rounded-lg font-mono text-sm break-all text-[#F0F0F0] mb-4">
                      {currentAddress}
                    </div>
                    <motion.button
                      onClick={() => handleCopy(currentAddress, selectedNetwork)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-lg font-bold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      {copiedAddress === selectedNetwork ? (
                        <>
                          <Check className="w-5 h-5" />
                          Address Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy Address
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#1E1E2B]/60 rounded-lg text-center">
                      <p className="text-xs text-[#B0B0B8] mb-1">Confirmations</p>
                      <p className="text-sm font-bold text-[#F0F0F0]">{currentInfo.confirmations}</p>
                    </div>
                    <div className="p-3 bg-[#1E1E2B]/60 rounded-lg text-center">
                      <p className="text-xs text-[#B0B0B8] mb-1">Est. Time</p>
                      <p className="text-sm font-bold text-[#F0F0F0]">{currentInfo.avgTime}</p>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="p-4 bg-[#1E1E2B]/60 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-[#641AE4] flex-shrink-0 mt-0.5" />
                      <p className="font-semibold text-[#F0F0F0] text-sm">Important</p>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[#B0B0B8] ml-6">
                      <li className="list-disc">Only send {selectedAsset} to this address</li>
                      <li className="list-disc">Verify the network matches your source</li>
                      <li className="list-disc">Deposits are credited after confirmations</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => {
                      setCurrentStep(1)
                      setSelectedNetwork(null)
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-[#2D2D3D] bg-[#2D2D3D] text-[#F0F0F0] font-semibold hover:border-[#641AE4]/40 transition-all"
                  >
                    New Deposit
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Asset-First Layout (visible on lg+) */}
      <div className="hidden lg:block">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-[#F0F0F0] font-semibold mb-1">Select asset first, then network</p>
            <p className="text-[#B0B0B8]">
              Choose the crypto asset you want to deposit, then select the network that matches your withdrawal platform. Always verify the network to avoid permanent loss of funds.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Asset Selection */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-[#B0B0B8] mb-3 uppercase tracking-wide">Select Asset</h3>
            <div className="space-y-3 mb-6">
              {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map((asset, index) => (
                <motion.button
                  key={asset}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAssetChange(asset)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAsset === asset
                      ? "bg-[#641AE4]/20 border-[#641AE4]/40 shadow-lg"
                      : "bg-[#2D2D3D] border-[#2D2D3D] hover:border-[#641AE4]/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{CRYPTO_ASSETS[asset].icon}</span>
                      <div>
                        <span className="font-semibold text-[#F0F0F0] block">{CRYPTO_ASSETS[asset].symbol}</span>
                        <span className="text-xs text-[#B0B0B8]">{CRYPTO_ASSETS[asset].name}</span>
                      </div>
                    </div>
                    {selectedAsset === asset && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-[#C8F55A] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-[#1E1E2B]" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-xs text-[#B0B0B8]">
                    Available on {getNetworksForAsset(asset).length} network{getNetworksForAsset(asset).length !== 1 ? 's' : ''}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Network Selection */}
            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-sm font-semibold text-[#B0B0B8] mb-3 uppercase tracking-wide">
                  Select Network for {selectedAsset}
                </h3>
                <div className="space-y-2">
                  {availableNetworks.map((network, index) => (
                    <motion.button
                      key={network}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedNetwork(network)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        currentNetwork === network
                          ? "bg-gradient-to-br " + NETWORK_INFO[network].color + " " + NETWORK_INFO[network].borderColor + " shadow-lg"
                          : "bg-[#2D2D3D] border-[#2D2D3D] hover:border-[#641AE4]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#F0F0F0] text-sm">{CRYPTO_NETWORKS[network].name}</span>
                        {currentNetwork === network && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 rounded-full bg-[#C8F55A] flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-[#1E1E2B]" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-[#B0B0B8]">
                        <span>Fees: {NETWORK_INFO[network].fees}</span>
                        <span>{NETWORK_INFO[network].avgTime}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Wallet Address Display */}
          <div className="lg:col-span-2">
            {currentNetwork && currentInfo ? (
              <>
                <h3 className="text-sm font-semibold text-[#B0B0B8] mb-3 uppercase tracking-wide">
                  {selectedAsset} Deposit Address ({CRYPTO_NETWORKS[currentNetwork].name})
                </h3>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedAsset}-${currentNetwork}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 bg-gradient-to-br ${currentInfo.color} border-2 ${currentInfo.borderColor} rounded-xl`}
                  >
                    {/* Address */}
                    <div className="mb-6">
                      <label className="text-xs font-semibold text-[#B0B0B8] mb-2 block uppercase tracking-wide">
                        {selectedAsset} Wallet Address
                      </label>
                      <div className="p-4 bg-[#1E1E2B] rounded-lg font-mono text-sm break-all text-[#F0F0F0] mb-3">
                        {currentAddress}
                      </div>
                      <motion.button
                        onClick={() => handleCopy(currentAddress, currentNetwork)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        {copiedAddress === currentNetwork ? (
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
                        <p className="text-xs text-[#B0B0B8] mb-1">Selected Asset</p>
                        <p className="text-sm font-semibold text-[#F0F0F0] flex items-center gap-2">
                          <span className="text-lg">{CRYPTO_ASSETS[selectedAsset].icon}</span>
                          {selectedAsset}
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
                        <li className="list-disc">Only send {selectedAsset} on the {CRYPTO_NETWORKS[currentNetwork].name}</li>
                        <li className="list-disc">Minimum deposit: Check current limits in your dashboard</li>
                        <li className="list-disc">Deposits are credited after {currentInfo.confirmations}</li>
                        <li className="list-disc">Do not send NFTs or other tokens to this address</li>
                      </ul>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-[#2D2D3D] rounded-xl border-2 border-dashed border-[#2D2D3D]">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏦</div>
                  <p className="text-[#B0B0B8] mb-2">Select an asset to view deposit address</p>
                  <p className="text-sm text-[#666]">Choose from the available crypto assets on the left</p>
                </div>
              </div>
            )}

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
      </div>
    </motion.div>
  )
}
