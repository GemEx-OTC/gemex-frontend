"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_NETWORKS, CRYPTO_ASSETS } from "@/lib/constants"
import { Copy, Check, AlertCircle, Info, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
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
  },
  BSC: {
    assets: ["USDT", "USDC"],
    confirmations: "15 confirmations",
    avgTime: "~3 minutes",
    fees: "Low",
  },
  ERC20: {
    assets: ["USDT", "USDC"],
    confirmations: "12 confirmations",
    avgTime: "~3 minutes",
    fees: "Medium",
  },
  BTC: {
    assets: ["BTC"],
    confirmations: "2 confirmations",
    avgTime: "~20 minutes",
    fees: "Variable",
  },
} as const

// Asset-specific colors and icons
const ASSET_INFO = {
  USDT: {
    color: "from-emerald-500/10 to-teal-500/5",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/10",
    textColor: "text-emerald-800 dark:text-emerald-200",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: "/icons/usdt.svg",
    brandColor: "#26A17B", // Tether brand color
  },
  USDC: {
    color: "from-blue-500/10 to-indigo-500/5",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/10",
    textColor: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: "/icons/usdc.svg",
    brandColor: "#2775CA", // USDC brand color
  },
  BTC: {
    color: "from-orange-500/10 to-amber-500/5",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-50/50 dark:bg-orange-950/10",
    textColor: "text-orange-800 dark:text-orange-200",
    iconColor: "text-orange-600 dark:text-orange-400",
    icon: "/icons/btc.svg",
    brandColor: "#F7931A", // Bitcoin brand color
  },
} as const

// Network-specific colors and chain logos
const NETWORK_CHAIN_INFO = {
  TRC20: {
    name: "Tron",
    logo: "/icons/chains/tron.svg",
    brandColor: "#FF060E",
  },
  BSC: {
    name: "BNB Smart Chain", 
    logo: "/icons/chains/bnb.svg",
    brandColor: "#F3BA2F",
  },
  ERC20: {
    name: "Ethereum",
    logo: "/icons/chains/eth.svg", 
    brandColor: "#627EEA",
  },
  BTC: {
    name: "Bitcoin",
    logo: "/icons/btc.svg", // Reusing BTC logo for Bitcoin network
    brandColor: "#F7931A",
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
  const [selectedAsset, setSelectedAsset] = useState<AssetKey | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Get available networks for the selected asset
  const availableNetworks = selectedAsset ? getNetworksForAsset(selectedAsset) : []
  
  // Current network is only the explicitly selected one
  const currentNetwork = selectedNetwork && selectedAsset && availableNetworks.includes(selectedNetwork) 
    ? selectedNetwork 
    : null

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
    if (selectedAsset === asset) {
      // If clicking the same asset, collapse it
      setSelectedAsset(null)
      setSelectedNetwork(null)
    } else {
      // Expand new asset and reset network
      setSelectedAsset(asset)
      setSelectedNetwork(null)
    }
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
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center max-w-md">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                        currentStep >= step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border-2 border-border"
                      }`}
                      animate={{
                        scale: currentStep === step.number ? 1.1 : 1,
                      }}
                    >
                      {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                    </motion.div>
                    <div className="mt-3 text-center">
                      <p className={`text-xs font-semibold hidden sm:block ${
                        currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 sm:w-20 h-1 mx-3 sm:mx-4 bg-border rounded-full relative overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Step Title */}
          <div className="sm:hidden text-center">
            <h3 className="text-xl font-bold text-foreground mb-1">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Navigation Header for Mobile */}
        {currentStep > 1 && (
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={handleBack}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:border-primary/40 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </motion.button>
            <div className="px-3 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {steps.length}
              </span>
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
              <div className="space-y-6">
                <div className="p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Choose Your Cryptocurrency</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      Select the cryptocurrency you want to deposit. Each asset supports different blockchain networks.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map((asset, index) => {
                    const assetInfo = ASSET_INFO[asset]
                    return (
                      <motion.button
                        key={asset}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        onClick={() => handleAssetSelect(asset)}
                        className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all text-left group"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                            <Image
                              src={assetInfo.icon}
                              alt={`${asset} icon`}
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-xl mb-1">
                              {CRYPTO_ASSETS[asset].symbol}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {CRYPTO_ASSETS[asset].name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {getNetworksForAsset(asset).length} network{getNetworksForAsset(asset).length !== 1 ? 's' : ''} available
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Network Selection */}
            {currentStep === 2 && selectedAsset && (
              <div className="space-y-6">
                <div className="p-5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={ASSET_INFO[selectedAsset].icon}
                        alt={`${selectedAsset} icon`}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                        Select Network for {selectedAsset}
                      </h4>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                      Choose the blockchain network that matches your source wallet or exchange platform.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {availableNetworks.map((network, index) => {
                    const networkInfo = NETWORK_INFO[network]
                    const chainInfo = NETWORK_CHAIN_INFO[network]
                    
                    return (
                      <motion.button
                        key={network}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        onClick={() => handleNetworkSelect(network)}
                        className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all text-left group"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                            <Image
                              src={chainInfo.logo}
                              alt={`${chainInfo.name} logo`}
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-xl mb-1">
                              {CRYPTO_NETWORKS[network].name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {chainInfo.name} Network
                            </p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                              Network Fees
                            </p>
                            <p className="font-bold text-foreground text-lg">{networkInfo.fees}</p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                              Chain ID
                            </p>
                            <p className="font-bold text-foreground text-lg">{CRYPTO_NETWORKS[network].chain}</p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Address Display */}
            {currentStep === 3 && selectedAsset && selectedNetwork && currentInfo && (
              <div className="space-y-6">
                <div className="p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Your Deposit Address is Ready!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                      Copy this address to receive {selectedAsset} on {CRYPTO_NETWORKS[selectedNetwork].name}.
                    </p>
                  </div>
                </div>

                {/* Address Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-card border-2 border-border rounded-2xl shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-4 shadow-sm">
                      <Image
                        src={ASSET_INFO[selectedAsset].icon}
                        alt={`${selectedAsset} icon`}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-2xl mb-1">{selectedAsset}</h3>
                      <div className="flex items-center gap-2">
                        <Image
                          src={NETWORK_CHAIN_INFO[selectedNetwork].logo}
                          alt={`${NETWORK_CHAIN_INFO[selectedNetwork].name} logo`}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        <p className="text-sm font-medium text-muted-foreground">
                          {CRYPTO_NETWORKS[selectedNetwork].name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      Wallet Address
                    </label>
                    <div className="p-4 bg-muted rounded-xl font-mono text-sm break-all text-foreground border border-border mb-4 leading-relaxed">
                      {currentAddress}
                    </div>
                    <motion.button
                      onClick={() => handleCopy(currentAddress, selectedNetwork)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-3 text-lg shadow-sm"
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

                  {/* Network Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Network Fees
                      </p>
                      <p className="text-lg font-bold text-foreground">{currentInfo.fees}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Chain ID
                      </p>
                      <p className="text-lg font-bold text-foreground">{CRYPTO_NETWORKS[selectedNetwork].chain}</p>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm">
                          Important Security Notes
                        </h5>
                        <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Only send {selectedAsset} to this address</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Verify the network matches your source</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Wrong network = permanent loss of funds</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      setCurrentStep(1)
                      setSelectedAsset(null)
                      setSelectedNetwork(null)
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-4 rounded-xl border-2 border-border bg-card text-foreground font-semibold hover:border-primary/40 hover:shadow-sm transition-all"
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
          className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Get Your Deposit Address</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
              Select the cryptocurrency you want to deposit, then choose the blockchain network that matches your source wallet or exchange. 
              Always double-check the network to prevent loss of funds.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Tree Selection */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Choose Asset & Network</h3>
              <p className="text-sm text-muted-foreground">Select cryptocurrency and blockchain network</p>
            </div>
            
            <div className="space-y-4">
              {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map((asset, assetIndex) => {
                const assetNetworks = getNetworksForAsset(asset)
                const isAssetExpanded = selectedAsset === asset
                const assetInfo = ASSET_INFO[asset]
                
                return (
                  <motion.div
                    key={asset}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: assetIndex * 0.1 }}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isAssetExpanded 
                        ? 'shadow-xl border-2 border-primary/20' 
                        : 'shadow-sm border border-border hover:shadow-md hover:border-primary/30'
                    }`}
                  >
                    {/* Asset Header */}
                    <motion.button
                      onClick={() => handleAssetChange(asset)}
                      className={`w-full p-6 text-left transition-all duration-300 ${
                        isAssetExpanded 
                          ? 'bg-white dark:bg-gray-900' 
                          : 'bg-card hover:bg-muted/50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-5">
                        <motion.div
                          animate={{ rotate: isAssetExpanded ? 90 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="text-muted-foreground"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                        
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                          <Image
                            src={assetInfo.icon}
                            alt={`${asset} icon`}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-xl text-foreground mb-1">
                            {CRYPTO_ASSETS[asset].symbol}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {CRYPTO_ASSETS[asset].name}
                          </p>
                        </div>
                        
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {assetNetworks.length} network{assetNetworks.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isAssetExpanded ? 'Click to collapse' : 'Click to expand'}
                            </div>
                          </div>
                          
                          {selectedAsset === asset && selectedNetwork && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-md"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>

                    {/* Network Options */}
                    <AnimatePresence>
                      {isAssetExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/30"
                        >
                          <div className="p-6">
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Available Networks for {asset}
                              </h5>
                            </div>
                            
                            <div className="space-y-3">
                              {assetNetworks.map((network, networkIndex) => {
                                const isSelected = selectedNetwork === network
                                const networkInfo = NETWORK_INFO[network]
                                const chainInfo = NETWORK_CHAIN_INFO[network]
                                
                                return (
                                  <motion.button
                                    key={network}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: networkIndex * 0.1 }}
                                    onClick={() => setSelectedNetwork(network)}
                                    className={`w-full p-5 rounded-xl text-left transition-all border-2 ${
                                      isSelected
                                        ? 'bg-white dark:bg-gray-900 border-primary shadow-lg'
                                        : 'bg-white/70 dark:bg-gray-800/70 border-border hover:border-primary/40 hover:shadow-md'
                                    }`}
                                    whileHover={{ scale: 1.01, y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                  >
                                    <div className="flex items-center gap-4">
                                      {/* Connection Line */}
                                      <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                                          isSelected 
                                            ? 'border-primary bg-primary/10' 
                                            : 'border-border bg-muted/30'
                                        }`}>
                                          {isSelected ? (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="w-5 h-5 rounded-full bg-primary"
                                            />
                                          ) : (
                                            <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                                          )}
                                        </div>
                                        {networkIndex < assetNetworks.length - 1 && (
                                          <div className={`w-0.5 h-6 mt-2 ${
                                            isSelected ? 'bg-primary' : 'bg-border'
                                          }`} />
                                        )}
                                      </div>
                                      
                                      {/* Chain Logo */}
                                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center p-2.5 shadow-sm">
                                        <Image
                                          src={chainInfo.logo}
                                          alt={`${chainInfo.name} logo`}
                                          width={28}
                                          height={28}
                                          className="w-7 h-7"
                                        />
                                      </div>
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-bold text-lg text-foreground">
                                            {CRYPTO_NETWORKS[network].name}
                                          </h5>
                                          {isSelected && (
                                            <motion.div
                                              initial={{ scale: 0, rotate: -180 }}
                                              animate={{ scale: 1, rotate: 0 }}
                                              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm"
                                            >
                                              <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div className="text-muted-foreground">
                                            <span className="font-medium">Chain:</span>
                                            <span className="ml-2 font-semibold text-foreground">
                                              {CRYPTO_NETWORKS[network].chain}
                                            </span>
                                          </div>
                                          <div className="text-muted-foreground">
                                            <span className="font-medium">Fees:</span>
                                            <span className="ml-2 font-semibold text-foreground">
                                              {networkInfo.fees}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Selection Summary */}
            {selectedAsset && selectedNetwork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 p-1.5 shadow-sm">
                        <Image
                          src={ASSET_INFO[selectedAsset].icon}
                          alt={`${selectedAsset} icon`}
                          width={20}
                          height={20}
                          className="w-full h-full"
                        />
                      </div>
                      <p className="font-bold text-lg text-green-900 dark:text-green-100">
                        {selectedAsset} on {CRYPTO_NETWORKS[selectedNetwork].name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Configuration complete • Ready to generate deposit address
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Helper Text */}
            {!selectedAsset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-8 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center"
              >
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl mb-4"
                >
                  👆
                </motion.div>
                <h4 className="font-semibold text-foreground mb-2">Choose Your Cryptocurrency</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any cryptocurrency above to see available blockchain networks
                </p>
              </motion.div>
            )}

            {selectedAsset && !selectedNetwork && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={ASSET_INFO[selectedAsset].icon}
                        alt={`${selectedAsset} icon`}
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Choose a network for {selectedAsset}
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Select the blockchain network that matches your source wallet or exchange
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full bg-blue-500"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Wallet Address Display */}
          <div className="lg:col-span-3">
            {currentNetwork && currentInfo ? (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your {selectedAsset} Deposit Address
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use this address to receive {selectedAsset} on {CRYPTO_NETWORKS[currentNetwork].name}
                  </p>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedAsset}-${currentNetwork}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Address Card */}
                    <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                          {CRYPTO_ASSETS[selectedAsset].icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-lg">{selectedAsset}</h4>
                          <p className="text-sm text-muted-foreground">{CRYPTO_NETWORKS[currentNetwork].name}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                          Wallet Address
                        </label>
                        <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all text-foreground border border-border mb-4">
                          {currentAddress}
                        </div>
                        <motion.button
                          onClick={() => handleCopy(currentAddress, currentNetwork)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          {copiedAddress === currentNetwork ? (
                            <>
                              <Check className="w-4 h-4" />
                              Address Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Address
                            </>
                          )}
                        </motion.button>
                      </div>

                      {/* Network Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Selected Asset</p>
                          <p className="text-lg font-bold text-foreground flex items-center gap-2">
                            <span className="text-xl">{CRYPTO_ASSETS[selectedAsset].icon}</span>
                            {selectedAsset}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Network Fees</p>
                          <p className="text-lg font-bold text-foreground">{currentInfo.fees}</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Security Notes</h4>
                          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>Only send {selectedAsset} to this address on {CRYPTO_NETWORKS[currentNetwork].name}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>Double-check the network matches your source wallet or exchange</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>Sending other tokens or wrong network will result in permanent loss</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* How It Works */}
                    <div className="p-6 bg-card border border-border rounded-xl">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        How Deposits Work
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                          <div>
                            <p className="font-medium text-foreground">Copy Address</p>
                            <p className="text-sm text-muted-foreground">Copy the wallet address above</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                          <div>
                            <p className="font-medium text-foreground">Send Crypto</p>
                            <p className="text-sm text-muted-foreground">Transfer from your wallet or exchange</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                          <div>
                            <p className="font-medium text-foreground">Wait for Confirmation</p>
                            <p className="text-sm text-muted-foreground">Blockchain processes automatically</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                          <div>
                            <p className="font-medium text-foreground">Start Trading</p>
                            <p className="text-sm text-muted-foreground">Balance updates, ready to trade</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4 mx-auto">
                    🏦
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Select Asset & Network</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Choose a cryptocurrency and network from the options on the left to view your deposit address
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
