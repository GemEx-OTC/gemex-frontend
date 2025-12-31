"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_NETWORKS, CRYPTO_ASSETS } from "@/lib/constants"
import { Copy, Check, AlertCircle, Info, ChevronLeft, ChevronRight, Loader2, Wallet, Sparkles } from "lucide-react"
import Image from "next/image"
import { copyToClipboard } from "@/lib/clipboard"
import { useMyWallets } from "@/lib/hooks/use-wallets"

type NetworkKey = "TRC20" | "BSC" | "BTC"
type AssetKey = keyof typeof CRYPTO_ASSETS

const NETWORK_INFO: Record<NetworkKey, { assets: string[]; fees: string }> = {
  TRC20: { assets: ["USDT"], fees: "Very Low" },
  BSC: { assets: ["USDT", "USDC"], fees: "Low" },
  BTC: { assets: ["BTC"], fees: "Variable" },
}

const ASSET_INFO = {
  USDT: { icon: "/icons/usdt.svg" },
  USDC: { icon: "/icons/usdc.svg" },
  BTC: { icon: "/icons/btc.svg" },
} as const

const NETWORK_CHAIN_INFO: Record<NetworkKey, { name: string; logo: string }> = {
  TRC20: { name: "Tron", logo: "/icons/chains/tron.svg" },
  BSC: { name: "BNB Smart Chain", logo: "/icons/chains/bnb.svg" },
  BTC: { name: "Bitcoin", logo: "/icons/btc.svg" },
}

const getNetworksForAsset = (asset: AssetKey): NetworkKey[] => {
  return (Object.keys(NETWORK_INFO) as NetworkKey[]).filter(network =>
    NETWORK_INFO[network].assets.includes(asset)
  )
}

// Wallet Preparation Modal Component
function WalletPreparationModal({ isOpen, isCreating }: { isOpen: boolean; isCreating: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#641AE4] to-[#C8F55A] p-1"
            >
              <div className="w-full h-full rounded-full bg-[#1E1E2B] flex items-center justify-center">
                <Wallet className="w-8 h-8 text-[#C8F55A]" />
              </div>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-[#F0F0F0] mb-3">
              {isCreating ? "Creating Your Wallets" : "Loading Wallets"}
            </h3>
            
            <p className="text-[#B0B0B8] mb-6">
              {isCreating 
                ? "We're generating secure wallet addresses for you across multiple blockchain networks. This may take a moment..."
                : "Fetching your wallet addresses..."
              }
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#641AE4]" />
              <span className="text-sm text-[#808090]">Please wait...</span>
            </div>

            {isCreating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 p-4 bg-[#2D2D3D]/50 rounded-lg"
              >
                <div className="flex items-center gap-2 text-[#C8F55A] text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Setting up TRC20, BSC & BTC wallets</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function WalletPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAsset, setSelectedAsset] = useState<AssetKey | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [showPreparationModal, setShowPreparationModal] = useState(false)

  // Fetch wallets from backend
  const { data: walletsData, isLoading, error, isSuccess } = useMyWallets()

  // Show preparation modal while loading or creating
  useEffect(() => {
    if (isLoading) {
      setShowPreparationModal(true)
    } else if (isSuccess) {
      // Small delay to show "created" message if wallets were just created
      if (walletsData?.created) {
        setTimeout(() => setShowPreparationModal(false), 1500)
      } else {
        setShowPreparationModal(false)
      }
    }
  }, [isLoading, isSuccess, walletsData?.created])

  // Build wallet addresses map from API data
  const walletAddresses: Record<string, string> = {}
  if (walletsData?.wallets) {
    walletsData.wallets.forEach(w => {
      walletAddresses[w.network] = w.address
    })
  }

  const availableNetworks = selectedAsset ? getNetworksForAsset(selectedAsset) : []
  const currentNetwork = selectedNetwork && selectedAsset && availableNetworks.includes(selectedNetwork) ? selectedNetwork : null
  const currentAddress = currentNetwork ? walletAddresses[currentNetwork] || "" : ""
  const currentInfo = currentNetwork ? NETWORK_INFO[currentNetwork] : null

  const handleCopy = async (address: string, network: NetworkKey) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(network)
      setTimeout(() => setCopiedAddress(null), 2000)
    }
  }

  const handleAssetChange = (asset: AssetKey) => {
    if (selectedAsset === asset) {
      setSelectedAsset(null)
      setSelectedNetwork(null)
    } else {
      setSelectedAsset(asset)
      setSelectedNetwork(null)
    }
  }

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

  const steps = [
    { number: 1, title: "Choose Asset", description: "Select crypto to deposit" },
    { number: 2, title: "Pick Network", description: "Choose blockchain network" },
    { number: 3, title: "Get Address", description: "Copy deposit address" },
  ]

  // Error state
  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DashboardHeader title="Deposit Wallets" subtitle="Your unique wallet addresses for receiving crypto deposits" />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-[#F0F0F0] mb-2">Failed to Load Wallets</h3>
          <p className="text-[#808090] mb-4">There was an error loading your wallet addresses.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#641AE4] text-white rounded-lg font-medium hover:bg-[#641AE4]/80">
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Wallet Preparation Modal */}
      <WalletPreparationModal isOpen={showPreparationModal} isCreating={walletsData?.created || false} />

      <DashboardHeader title="Deposit Wallets" subtitle="Your unique wallet addresses for receiving crypto deposits" />

      {/* Mobile Multi-Step Wizard */}
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
                        currentStep >= step.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border-2 border-border"
                      }`}
                      animate={{ scale: currentStep === step.number ? 1.1 : 1 }}
                    >
                      {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                    </motion.div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 sm:w-20 h-1 mx-3 sm:mx-4 bg-border rounded-full relative overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: currentStep > step.number ? "100%" : "0%" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="sm:hidden text-center">
            <h3 className="text-xl font-bold text-foreground mb-1">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {currentStep > 1 && (
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleBack} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-foreground font-semibold">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="px-3 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium text-foreground">Step {currentStep} of {steps.length}</span>
            </div>
          </div>
        )}

        {/* Mobile Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Step 1: Asset Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Choose Your Cryptocurrency</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Select the cryptocurrency you want to deposit.</p>
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
                      className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                          <Image src={ASSET_INFO[asset].icon} alt={asset} width={32} height={32} className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-xl mb-1">{CRYPTO_ASSETS[asset].symbol}</h3>
                          <p className="text-sm text-muted-foreground font-medium">{CRYPTO_ASSETS[asset].name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{getNetworksForAsset(asset).length} networks</span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </motion.button>
                  ))}
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
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Select Network for {selectedAsset}</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Choose the blockchain network that matches your source.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {availableNetworks.map((network, index) => {
                    const chainInfo = NETWORK_CHAIN_INFO[network]
                    const hasAddress = !!walletAddresses[network]
                    return (
                      <motion.button
                        key={network}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleNetworkSelect(network)}
                        disabled={!hasAddress}
                        className={`w-full p-6 rounded-2xl border-2 text-left group ${
                          hasAddress 
                            ? "border-border bg-card hover:border-primary/40 hover:shadow-lg" 
                            : "border-border/50 bg-card/50 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                            <Image src={chainInfo.logo} alt={chainInfo.name} width={32} height={32} className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-xl mb-1">{CRYPTO_NETWORKS[network].name}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{chainInfo.name} Network</p>
                          </div>
                          {hasAddress && <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary" />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Fees</p>
                            <p className="font-bold text-foreground">{NETWORK_INFO[network].fees}</p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Chain</p>
                            <p className="font-bold text-foreground">{CRYPTO_NETWORKS[network].chain}</p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Address Display */}
            {currentStep === 3 && selectedAsset && selectedNetwork && currentInfo && currentAddress && (
              <div className="space-y-6">
                <div className="p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Your Deposit Address is Ready!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Copy this address to receive {selectedAsset} on {CRYPTO_NETWORKS[selectedNetwork].name}.</p>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-card border-2 border-border rounded-2xl shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-4 shadow-sm">
                      <Image src={ASSET_INFO[selectedAsset].icon} alt={selectedAsset} width={32} height={32} className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-2xl mb-1">{selectedAsset}</h3>
                      <div className="flex items-center gap-2">
                        <Image src={NETWORK_CHAIN_INFO[selectedNetwork].logo} alt={NETWORK_CHAIN_INFO[selectedNetwork].name} width={16} height={16} className="w-4 h-4" />
                        <p className="text-sm font-medium text-muted-foreground">{CRYPTO_NETWORKS[selectedNetwork].name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-semibold text-foreground mb-3 block">Wallet Address</label>
                    <div className="p-4 bg-muted rounded-xl font-mono text-sm break-all text-foreground border border-border mb-4">{currentAddress}</div>
                    <motion.button
                      onClick={() => handleCopy(currentAddress, selectedNetwork)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-3 text-lg shadow-sm"
                    >
                      {copiedAddress === selectedNetwork ? <><Check className="w-5 h-5" /> Address Copied!</> : <><Copy className="w-5 h-5" /> Copy Address</>}
                    </motion.button>
                  </div>

                  <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 text-sm">Important</h5>
                        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                          <li>• Only send {selectedAsset} to this address</li>
                          <li>• Verify the network matches your source</li>
                          <li>• Wrong network = permanent loss of funds</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => { setCurrentStep(1); setSelectedAsset(null); setSelectedNetwork(null); }}
                  className="w-full px-6 py-4 rounded-xl border-2 border-border bg-card text-foreground font-semibold hover:border-primary/40"
                >
                  New Deposit
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Get Your Deposit Address</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Select the cryptocurrency you want to deposit, then choose the blockchain network that matches your source wallet or exchange.</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Asset Selection */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Choose Asset & Network</h3>
              <p className="text-sm text-muted-foreground">Select cryptocurrency and blockchain network</p>
            </div>
            
            <div className="space-y-4">
              {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map((asset, assetIndex) => {
                const assetNetworks = getNetworksForAsset(asset)
                const isAssetExpanded = selectedAsset === asset
                
                return (
                  <motion.div
                    key={asset}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: assetIndex * 0.1 }}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${isAssetExpanded ? 'shadow-xl border-2 border-primary/20' : 'shadow-sm border border-border hover:shadow-md hover:border-primary/30'}`}
                  >
                    <motion.button
                      onClick={() => handleAssetChange(asset)}
                      className={`w-full p-6 text-left transition-all duration-300 ${isAssetExpanded ? 'bg-white dark:bg-gray-900' : 'bg-card hover:bg-muted/50'}`}
                    >
                      <div className="flex items-center gap-5">
                        <motion.div animate={{ rotate: isAssetExpanded ? 90 : 0 }} className="text-muted-foreground">
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-3 shadow-sm">
                          <Image src={ASSET_INFO[asset].icon} alt={asset} width={32} height={32} className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xl text-foreground mb-1">{CRYPTO_ASSETS[asset].symbol}</h4>
                          <p className="text-sm text-muted-foreground">{CRYPTO_ASSETS[asset].name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">{assetNetworks.length} networks</div>
                        </div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isAssetExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-6 pb-6 pt-2 space-y-3 bg-muted/20">
                            {assetNetworks.map((network) => {
                              const chainInfo = NETWORK_CHAIN_INFO[network]
                              const isSelected = selectedNetwork === network
                              const hasAddress = !!walletAddresses[network]
                              
                              return (
                                <motion.button
                                  key={network}
                                  onClick={() => hasAddress && setSelectedNetwork(network)}
                                  disabled={!hasAddress}
                                  className={`w-full p-4 rounded-xl text-left transition-all ${
                                    isSelected ? 'bg-primary/10 border-2 border-primary shadow-md' 
                                    : hasAddress ? 'bg-card border border-border hover:border-primary/40 hover:shadow-sm' 
                                    : 'bg-card/50 border border-border/50 opacity-60 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-2">
                                      <Image src={chainInfo.logo} alt={chainInfo.name} width={24} height={24} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-foreground">{CRYPTO_NETWORKS[network].name}</h5>
                                      <p className="text-xs text-muted-foreground">{chainInfo.name} • {NETWORK_INFO[network].fees} fees</p>
                                    </div>
                                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                                  </div>
                                </motion.button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Address Display Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedAsset && selectedNetwork && walletAddresses[selectedNetwork] ? (
                <motion.div key={`${selectedAsset}-${selectedNetwork}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="sticky top-6">
                  <div className="p-8 bg-card border-2 border-border rounded-2xl shadow-lg">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center p-5 shadow-sm">
                        <Image src={ASSET_INFO[selectedAsset].icon} alt={selectedAsset} width={40} height={40} className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-3xl mb-2">{selectedAsset}</h3>
                        <div className="flex items-center gap-3">
                          <Image src={NETWORK_CHAIN_INFO[selectedNetwork].logo} alt={NETWORK_CHAIN_INFO[selectedNetwork].name} width={20} height={20} className="w-5 h-5" />
                          <p className="text-lg font-medium text-muted-foreground">{CRYPTO_NETWORKS[selectedNetwork].name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="text-sm font-semibold text-foreground mb-4 block uppercase tracking-wide">Deposit Address</label>
                      <div className="p-5 bg-muted rounded-xl font-mono text-base break-all text-foreground border border-border mb-5">{walletAddresses[selectedNetwork]}</div>
                      <motion.button
                        onClick={() => handleCopy(walletAddresses[selectedNetwork], selectedNetwork)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-8 py-5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-3 text-lg shadow-md"
                      >
                        {copiedAddress === selectedNetwork ? <><Check className="w-6 h-6" /> Address Copied!</> : <><Copy className="w-6 h-6" /> Copy Address</>}
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 bg-muted/50 rounded-xl text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Network Fees</p>
                        <p className="text-xl font-bold text-foreground">{NETWORK_INFO[selectedNetwork].fees}</p>
                      </div>
                      <div className="p-5 bg-muted/50 rounded-xl text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Chain ID</p>
                        <p className="text-xl font-bold text-foreground">{CRYPTO_NETWORKS[selectedNetwork].chain}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">Important Security Notes</h5>
                          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>Only send {selectedAsset} to this address</li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>Verify the network matches your source</li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>Wrong network = permanent loss of funds</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky top-6">
                  <div className="p-12 bg-card border-2 border-dashed border-border rounded-2xl text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                      <Wallet className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Select Asset & Network</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">Choose a cryptocurrency and network from the left panel to view your deposit address.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
