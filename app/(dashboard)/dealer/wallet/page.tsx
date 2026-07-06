"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { CRYPTO_NETWORKS, CRYPTO_ASSETS } from "@/lib/constants"
import { Copy, Check, AlertCircle, Info, ChevronLeft, ChevronRight, Loader2, Wallet, Sparkles, Layers } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"
import { useMyWallets } from "@/lib/hooks/use-wallets"
import { QRCodeSVG } from "qrcode.react"
import { 
  NetworkEthereum, 
  NetworkBinanceSmartChain, 
  NetworkBase, 
  NetworkPolygon, 
  NetworkArbitrumOne, 
  NetworkOptimism,
  NetworkTron,
  NetworkBitcoin,
  TokenUSDT,
  TokenUSDC,
  TokenBTC
} from "@web3icons/react"

type NetworkKey = "TRC20" | "BSC" | "BASE" | "ETH" | "POLYGON" | "ARBITRUM" | "OPTIMISM"
type AssetKey = keyof typeof CRYPTO_ASSETS

const NETWORK_INFO: Record<NetworkKey, { assets: string[]; fees: string; speed: string }> = {
  BSC: { assets: ["USDT", "USDC"], fees: "Low", speed: "~3 mins" },
  BASE: { assets: ["USDT", "USDC"], fees: "Very Low", speed: "~2 mins" },
  ETH: { assets: ["USDT", "USDC"], fees: "High", speed: "~3 mins" },
  POLYGON: { assets: ["USDT", "USDC"], fees: "Very Low", speed: "~2 mins" },
  ARBITRUM: { assets: ["USDT", "USDC"], fees: "Very Low", speed: "~1 min" },
  OPTIMISM: { assets: ["USDT", "USDC"], fees: "Very Low", speed: "~1 min" },
  TRC20: { assets: ["USDT"], fees: "Very Low", speed: "~1 min" },
}

const EVM_NETWORKS: NetworkKey[] = ["BSC", "BASE", "ETH", "POLYGON", "ARBITRUM", "OPTIMISM"]

// Helper to render network icons from @web3icons/react
export function NetworkIconComponent({ network, size = 24 }: { network: NetworkKey; size?: number }) {
  switch (network) {
    case "TRC20":
      return <NetworkTron size={size} variant="branded" />
    case "BSC":
      return <NetworkBinanceSmartChain size={size} variant="branded" />
    case "BASE":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} className="web3icons flex-shrink-0" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#0052FF" />
          <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
        </svg>
      )
    case "ETH":
      return <NetworkEthereum size={size} variant="branded" />
    case "POLYGON":
      return <NetworkPolygon size={size} variant="branded" />
    case "ARBITRUM":
      return <NetworkArbitrumOne size={size} variant="branded" />
    case "OPTIMISM":
      return <NetworkOptimism size={size} variant="branded" />
  }
}

// Helper to render asset icons from @web3icons/react
export function TokenIconComponent({ asset, size = 24 }: { asset: AssetKey; size?: number }) {
  switch (asset) {
    case "USDT":
      return <TokenUSDT size={size} variant="branded" />
    case "USDC":
      return <TokenUSDC size={size} variant="branded" />
    case "BTC":
      return <TokenBTC size={size} variant="branded" />
  }
}

const getNetworksForAsset = (asset: AssetKey): NetworkKey[] => {
  return (Object.keys(NETWORK_INFO) as NetworkKey[]).filter(network =>
    NETWORK_INFO[network].assets.includes(asset)
  )
}

// Helper to generate EIP-681 URI for EVM token transfer or TRON address
function getQrCodeValue(network: NetworkKey, asset: AssetKey, address: string): string {
  if (!address) return ""

  const isTest = process.env.NODE_ENV !== "production" || 
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.includes("ngrok")))

  const coinIds: Record<string, string> = {
    BSC: "c20000714",
    ETH: "c60",
    TRC20: "c195",
    POLYGON: "c966",
    BASE: "c8453",
    ARBITRUM: "c42161",
    OPTIMISM: "c10",
  }

  const tokenAddresses: Record<string, Record<string, { mainnet: string; testnet: string }>> = {
    BSC: {
      USDT: { mainnet: "0x55d398326f99059ff775485246999027b3197955", testnet: "0xa8276D04067cAd623cC46927F4E0a6586a1198F3" },
      USDC: { mainnet: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", testnet: "0x64544969ed7EBf5f083679233325356EbE738930" },
    },
    BASE: {
      USDT: { mainnet: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", testnet: "0x3813e82e6f70f6b3f7f2b45f8f8f2b7f3f888888" },
      USDC: { mainnet: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", testnet: "0x036cbd53842c5426634e7929541ec2318f3dcf7e" },
    },
    ETH: {
      USDT: { mainnet: "0xdac17f958d2ee523a2206206994597c13d831ec7", testnet: "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0" },
      USDC: { mainnet: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", testnet: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238" },
    },
    POLYGON: {
      USDT: { mainnet: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", testnet: "0x1fde0e17e1192ca152a51fe6f40f8d91963f6075" },
      USDC: { mainnet: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", testnet: "0x41e94eb019c0762f9bfcf9fb151d372519b6284a" },
    },
    ARBITRUM: {
      USDT: { mainnet: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", testnet: "0x6ab707aca953e1a062f629cf7f8670560a6344d5" },
      USDC: { mainnet: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", testnet: "0x75faf114eafb1bdbe2f772240b098555a51603de" },
    },
    OPTIMISM: {
      USDT: { mainnet: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", testnet: "0x1f32349586fee969b02d77f92d56e72f8b6a27de" },
      USDC: { mainnet: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", testnet: "0x5fd84259d66bc461235cbc7022b720934d4576a8" },
    },
    TRC20: {
      USDT: { mainnet: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", testnet: "TXLAQ63Xg1VUr3NZ2Az1a9g14FSTa6A4B2" }
    }
  }

  const coinId = coinIds[network]
  if (!coinId) return address

  let assetId = coinId
  if (network === "TRC20") {
    const tokenAddr = tokenAddresses.TRC20.USDT.mainnet
    if (tokenAddr) {
      assetId = `${coinId}_t${tokenAddr}`
    }
  } else {
    const tokenAddrObj = tokenAddresses[network]?.[asset]
    if (tokenAddrObj) {
      const tokenAddress = isTest ? tokenAddrObj.testnet : tokenAddrObj.mainnet
      if (tokenAddress) {
        assetId = `${coinId}_t${tokenAddress}`
      }
    }
  }

  return `https://link.trustwallet.com/send?asset=${assetId}&address=${address}`
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
              {isCreating ? "Creating Your Deposit Wallets" : "Loading Wallets"}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {isCreating 
                ? "We are setting up your secure TRON & EVM deposit addresses. This is a one-time process and will only take a moment..."
                : "Fetching your secure wallet addresses..."
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
                <div className="flex items-center gap-2 text-secondary text-sm justify-center">
                  <Sparkles className="w-4 h-4" />
                  <span>Setting up Tron & EVM wallets</span>
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
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>("USDT")
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [showPreparationModal, setShowPreparationModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // For mobile wizard

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
  const sharedEvmAddress = walletsData?.wallets?.find(w => EVM_NETWORKS.includes(w.network as NetworkKey))?.address || ""

  if (walletsData?.wallets) {
    walletsData.wallets.forEach(w => {
      walletAddresses[w.network] = w.address
    })
  }

  // Share generated EVM wallet address to keep all EVM options clickable and selectable
  EVM_NETWORKS.forEach(net => {
    if (!walletAddresses[net] && sharedEvmAddress) {
      walletAddresses[net] = sharedEvmAddress
    }
  })

  // Pre-select first available network when asset changes on desktop
  useEffect(() => {
    if (selectedAsset) {
      const networks = getNetworksForAsset(selectedAsset)
      if (networks.length > 0 && !selectedNetwork) {
        const validNetwork = networks.find(n => !!walletAddresses[n]) || networks[0]
        setSelectedNetwork(validNetwork)
      }
    }
  }, [selectedAsset, walletsData])

  const availableNetworks = selectedAsset ? getNetworksForAsset(selectedAsset) : []
  const currentNetwork = selectedNetwork && selectedAsset && availableNetworks.includes(selectedNetwork) ? selectedNetwork : null
  const currentAddress = currentNetwork ? walletAddresses[currentNetwork] || "" : ""
  const currentInfo = currentNetwork ? NETWORK_INFO[currentNetwork] : null
  
  const qrCodeValue = (currentNetwork && selectedAsset && currentAddress)
    ? getQrCodeValue(currentNetwork, selectedAsset, currentAddress)
    : currentAddress

  const handleCopy = async (address: string, network: NetworkKey) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(network)
      setTimeout(() => setCopiedAddress(null), 2000)
    }
  }

  const handleAssetSelect = (asset: AssetKey) => {
    setSelectedAsset(asset)
    if (asset === "BTC") {
      setSelectedNetwork(null)
      setCurrentStep(3)
      return
    }
    const networks = getNetworksForAsset(asset)
    const validNetwork = networks.find(n => !!walletAddresses[n]) || networks[0]
    setSelectedNetwork(validNetwork)
    setCurrentStep(2)
  }

  const handleNetworkSelect = (network: NetworkKey) => {
    setSelectedNetwork(network)
    setCurrentStep(3)
  }

  const isEvmSelected = selectedNetwork ? EVM_NETWORKS.includes(selectedNetwork) : false
  const evmSharedNetworks = selectedNetwork 
    ? EVM_NETWORKS.filter(n => n !== selectedNetwork && availableNetworks.includes(n))
    : []

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DashboardHeader title="Dealer Wallets" subtitle="Your wallet addresses for receiving crypto deposits" />
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto mt-10">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Failed to Load Wallets</h3>
          <p className="text-muted-foreground mb-6 text-center">There was an error loading your wallet addresses. Please check your connection or contact support.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 transition-all">
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <WalletPreparationModal isOpen={showPreparationModal} isCreating={walletsData?.created || false} />

      <DashboardHeader title="Dealer Wallets" subtitle="View and copy your backend deposit addresses for trades" />

      {/* Mobile Multi-Step Wizard */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Header Steps */}
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">{currentStep}</span>
            <div>
              <h4 className="font-bold text-foreground text-sm">
                {currentStep === 1 ? "Select Asset" : currentStep === 2 ? "Select Network" : "Deposit Address"}
              </h4>
              <p className="text-xs text-muted-foreground">Step {currentStep} of 3</p>
            </div>
          </div>
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-xs font-semibold text-primary flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Mobile Asset Selection */}
            {currentStep === 1 && (
              <div className="grid gap-3">
                {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map(asset => {
                  const isComingSoon = asset === "BTC"
                  return (
                    <button
                      key={asset}
                      onClick={() => handleAssetSelect(asset)}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 text-left flex items-center justify-between group transition-all relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <TokenIconComponent asset={asset} size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-lg">{CRYPTO_ASSETS[asset].symbol}</h4>
                            {isComingSoon && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-extrabold tracking-wide uppercase">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{CRYPTO_ASSETS[asset].name}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 2: Mobile Network Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 border border-border rounded-xl text-center">
                  <p className="text-sm text-muted-foreground">Depositing <span className="font-bold text-foreground">{selectedAsset}</span></p>
                </div>
                <div className="grid gap-3">
                  {availableNetworks.map(network => {
                    const hasAddress = !!walletAddresses[network]
                    const isEvm = EVM_NETWORKS.includes(network)
                    return (
                      <button
                        key={network}
                        disabled={!hasAddress}
                        onClick={() => handleNetworkSelect(network)}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          hasAddress 
                            ? "bg-card border-border hover:border-primary/30" 
                            : "bg-card/40 border-border/40 opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <NetworkIconComponent network={network} size={24} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-foreground text-sm">{CRYPTO_NETWORKS[network].name}</h5>
                              {isEvm && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-extrabold tracking-wide uppercase">
                                  EVM
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">{NETWORK_INFO[network].fees} fees • {NETWORK_INFO[network].speed}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Mobile Address & details */}
            {currentStep === 3 && (
              selectedAsset === "BTC" ? (
                <div className="space-y-4">
                  <div className="p-8 bg-card border border-border rounded-2xl text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                      <TokenIconComponent asset="BTC" size={48} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-foreground">Bitcoin Coming Soon</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We are currently integrating native Bitcoin (BTC) deposits. High-volume BTC trades can still be processed manually.
                      </p>
                    </div>
                    <a
                      href="mailto:support@gemotc.com"
                      className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center gap-2 text-sm shadow-md transition-all"
                    >
                      Contact OTC Desk
                    </a>
                  </div>
                  <button
                    onClick={() => { setCurrentStep(1); }}
                    className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/50"
                  >
                    Back to Assets
                  </button>
                </div>
              ) : (
                selectedNetwork && currentAddress && (
                  <div className="space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl text-center space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TokenIconComponent asset={selectedAsset} size={24} />
                          <span className="font-extrabold text-foreground">{selectedAsset}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs font-semibold text-foreground">
                          <NetworkIconComponent network={selectedNetwork} size={14} />
                          <span>{CRYPTO_NETWORKS[selectedNetwork].name}</span>
                        </div>
                      </div>

                      {/* QR Code Container */}
                      <div className="w-44 h-44 mx-auto p-3 bg-white rounded-xl shadow-md flex items-center justify-center">
                        <QRCodeSVG value={qrCodeValue} size={152} level="Q" includeMargin={false} fgColor="#000000" bgColor="#ffffff" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Dealer Wallet Address</span>
                        <div className="p-3 bg-muted rounded-xl font-mono text-xs break-all text-foreground border border-border">{currentAddress}</div>
                      </div>

                      <button
                        onClick={() => handleCopy(currentAddress, selectedNetwork)}
                        className="w-full py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.98] transition-all"
                      >
                        {copiedAddress === selectedNetwork ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Address</>}
                      </button>
                    </div>

                    {/* Shared EVM alert for mobile */}
                    {isEvmSelected && evmSharedNetworks.length > 0 && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                        <Layers className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-blue-900 dark:text-blue-100 text-xs mb-1">Shared EVM Address</h5>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300">
                            This address is identical across all EVM chains. You can send deposits to it on: <span className="font-semibold">{evmSharedNetworks.map(n => CRYPTO_NETWORKS[n].name).join(", ")}</span>.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1 text-amber-700 dark:text-amber-300">
                        <p className="font-bold text-amber-900 dark:text-amber-100">Dealer Safety Note</p>
                        <p>• Make sure to copy the exact address for testing or routing.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setCurrentStep(1); }}
                      className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/50"
                    >
                      Start Over
                    </button>
                  </div>
                )
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Gorgeous Interactive Grid Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-8">
        
        {/* Column 1: Left Selector Panel */}
        <div className="col-span-5 space-y-6">
          
          {/* Asset Tabs */}
          <div className="bg-card border border-border p-3 rounded-2xl">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Select Asset</h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CRYPTO_ASSETS) as AssetKey[]).map(asset => {
                const isActive = selectedAsset === asset
                const isComingSoon = asset === "BTC"
                return (
                  <button
                    key={asset}
                    onClick={() => { setSelectedAsset(asset); setSelectedNetwork(null); }}
                    className={`relative p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      isActive 
                        ? "bg-primary/10 border-primary text-foreground shadow-sm font-bold" 
                        : "bg-card border-border hover:border-border/80 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {isComingSoon && (
                      <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-extrabold tracking-wide uppercase animate-pulse">
                        Soon
                      </span>
                    )}
                    <TokenIconComponent asset={asset} size={28} />
                    <span className="text-sm font-semibold">{CRYPTO_ASSETS[asset].symbol}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeAssetGlow"
                        className="absolute -inset-[1px] border border-primary rounded-xl pointer-events-none"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Network Selection Grid */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Network</h3>
              <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground font-semibold">
                {availableNetworks.length} networks
              </span>
            </div>

            <div className="grid gap-3">
              {availableNetworks.map(network => {
                const hasAddress = !!walletAddresses[network]
                const isSelected = selectedNetwork === network
                const isEvm = EVM_NETWORKS.includes(network)

                return (
                  <button
                    key={network}
                    disabled={!hasAddress}
                    onClick={() => setSelectedNetwork(network)}
                    className={`relative p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isSelected 
                        ? "bg-primary/10 border-primary shadow-md" 
                        : hasAddress 
                          ? "bg-card border-border hover:border-primary/30 hover:shadow-sm" 
                          : "bg-card/40 border-border/40 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <NetworkIconComponent network={network} size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                            {CRYPTO_NETWORKS[network].name}
                          </h5>
                          {isEvm && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-extrabold tracking-wider uppercase">
                              EVM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Fees: <span className="font-semibold text-foreground/80">{NETWORK_INFO[network].fees}</span> • Time: <span className="font-semibold text-foreground/80">{NETWORK_INFO[network].speed}</span>
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Column 2: Right Address Panel */}
        <div className="col-span-7">
          <AnimatePresence mode="wait">
            {selectedAsset === "BTC" ? (
              <motion.div
                key="btc-coming-soon"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-card border border-border rounded-3xl p-12 shadow-xl text-center space-y-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]"
              >
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center p-4 shadow-inner relative z-10 animate-pulse">
                  <TokenIconComponent asset="BTC" size={56} />
                </div>

                <div className="space-y-3 max-w-md relative z-10">
                  <h3 className="text-3xl font-black text-foreground">Bitcoin Support Coming Soon</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We are currently integrating native Bitcoin (BTC) deposit addresses into our unified OTC platform. 
                    In the meantime, you can process manual high-volume BTC transactions directly via our OTC desk.
                  </p>
                </div>

                <div className="flex gap-4 w-full max-w-sm relative z-10">
                  <a
                    href="mailto:support@gemotc.com"
                    className="flex-1 py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black text-center text-sm shadow-lg hover:shadow-amber-500/15 transition-all duration-200"
                  >
                    Contact OTC Desk
                  </a>
                </div>
              </motion.div>
            ) : selectedAsset && selectedNetwork && currentAddress ? (
              <motion.div
                key={`${selectedAsset}-${selectedNetwork}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                {/* Header card details */}
                <div className="flex items-center justify-between border-b border-border pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-2.5">
                      <TokenIconComponent asset={selectedAsset} size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground">Dealer Wallet Details</h3>
                      <p className="text-sm text-muted-foreground">Secure pool deposit address</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl text-sm font-semibold border border-border">
                    <NetworkIconComponent network={selectedNetwork} size={16} />
                    <span>{CRYPTO_NETWORKS[selectedNetwork].name}</span>
                  </div>
                </div>

                {/* Deposit Address Box and QR Code Grid */}
                <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* QR Code Container */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-border flex items-center justify-center">
                      <QRCodeSVG value={qrCodeValue} size={140} level="Q" includeMargin={false} fgColor="#000000" bgColor="#ffffff" />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                      {selectedNetwork === "TRC20" ? "Scan QR Code" : "Scan with Trust Wallet / MetaMask"}
                    </span>
                  </div>

                  {/* Copy details */}
                  <div className="md:col-span-8 space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Wallet Deposit Address</label>
                      <div className="p-4 bg-muted/80 rounded-xl font-mono text-sm break-all text-foreground border border-border flex items-center justify-between gap-3">
                        <span className="select-all">{currentAddress}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(currentAddress, selectedNetwork)}
                      className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2.5 text-base shadow-lg hover:shadow-primary/15 transition-all duration-200 active:scale-[0.99]"
                    >
                      {copiedAddress === selectedNetwork ? (
                        <><Check className="w-5 h-5 animate-pulse" /> Address Copied!</>
                      ) : (
                        <><Copy className="w-5 h-5" /> Copy Wallet Address</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Shared EVM alert */}
                {isEvmSelected && evmSharedNetworks.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4 relative z-10"
                  >
                    <Layers className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Unified EVM Address</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        This address represents your unified EOA wallet. Deposits sent to this address on any of the following EVM networks will be credited:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {evmSharedNetworks.map(n => (
                          <div key={n} className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400">
                            <NetworkIconComponent network={n} size={12} />
                            <span>{CRYPTO_NETWORKS[n].name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <div className="bg-card border-2 border-dashed border-border rounded-3xl p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Wallet Selected</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Please select an asset and network on the left panel to display your dealer wallet address.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  )
}
