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
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary p-1"
            >
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <Wallet className="w-8 h-8 text-secondary" />
              </div>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {isCreating ? "Creating Your Wallets" : "Loading Wallets"}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {isCreating 
                ? "We're generating secure wallet addresses for you across multiple blockchain networks. This may take a moment..."
                : "Fetching your wallet addresses..."
              }
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Please wait...</span>
            </div>

            {isCreating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 text-secondary text-sm">
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

export default function DealerWalletPage() {
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

  // Error state
  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DashboardHeader title="Dealer Wallets" subtitle="Your wallet addresses for receiving crypto" />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Failed to Load Wallets</h3>
          <p className="text-muted-foreground mb-4">There was an error loading your wallet addresses.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/80">
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

      <DashboardHeader title="Dealer Wallets" subtitle="Your wallet addresses for receiving crypto deposits" />

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Dealer Wallet Addresses</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">These are your unique wallet addresses for receiving crypto. Select an asset and network to view the corresponding address.</p>
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
                    <label className="text-sm font-semibold text-foreground mb-4 block uppercase tracking-wide">Wallet Address</label>
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
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center">
                <div className="text-center p-12 bg-card border-2 border-dashed border-border rounded-2xl">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Select Asset & Network</h3>
                  <p className="text-muted-foreground max-w-sm">Choose a cryptocurrency and network from the left panel to view your wallet address.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
