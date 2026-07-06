"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Copy, Check, AlertCircle, Info, Loader2, Wallet, QrCode } from "lucide-react"
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

const NETWORK_INFO: Record<NetworkKey, { name: string; chain: string; assets: string[] }> = {
  BSC: { name: "BEP20", chain: "BNB Smart Chain", assets: ["USDT", "USDC"] },
  BASE: { name: "Base", chain: "Base Network", assets: ["USDT", "USDC"] },
  ETH: { name: "ERC20", chain: "Ethereum Mainnet", assets: ["USDT", "USDC"] },
  POLYGON: { name: "Polygon ERC20", chain: "Polygon Network", assets: ["USDT", "USDC"] },
  ARBITRUM: { name: "Arbitrum ERC20", chain: "Arbitrum One Network", assets: ["USDT", "USDC"] },
  OPTIMISM: { name: "Optimism ERC20", chain: "Optimism Network", assets: ["USDT", "USDC"] },
  TRC20: { name: "TRC20", chain: "Tron", assets: ["USDT"] },
}

const EVM_NETWORKS = ["BSC", "BASE", "ETH", "POLYGON", "ARBITRUM", "OPTIMISM"]

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
export function TokenIconComponent({ asset, size = 24 }: { asset: string; size?: number }) {
  switch (asset) {
    case "USDT":
      return <TokenUSDT size={size} variant="branded" />
    case "USDC":
      return <TokenUSDC size={size} variant="branded" />
    case "BTC":
      return <TokenBTC size={size} variant="branded" />
    default:
      return null
  }
}

export default function AdminWalletPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [activeQrModal, setActiveQrModal] = useState<{ address: string; network: NetworkKey } | null>(null)
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

  const rawWallets = walletsData?.wallets || []
  const sharedEvmAddress = rawWallets.find(w => EVM_NETWORKS.includes(w.network))?.address || ""

  const wallets = Object.keys(NETWORK_INFO).map(net => {
    const existing = rawWallets.find(w => w.network === net)
    if (existing) return existing
    if (EVM_NETWORKS.includes(net) && sharedEvmAddress) {
      return { network: net, address: sharedEvmAddress }
    }
    return { network: net, address: "" }
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <DashboardHeader title="Admin Wallet" subtitle="Your platform deposit addresses for receiving customer deposits" />

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-1 text-sm">System Pool Wallets</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            These addresses receive user fund transfers when processing OTC trades. All EVM networks (BEP20, Base, ERC20, Polygon, Arbitrum, Optimism) resolve to a single shared Ethereum-compatible keypair, which simplifies sweep administration.
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
          const isEvm = EVM_NETWORKS.includes(network)

          return (
            <motion.div
              key={network}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                hasAddress 
                  ? "bg-card border-border hover:border-primary/30 hover:shadow-md" 
                  : "bg-card/50 border-border/50 opacity-55"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <NetworkIconComponent network={network} size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-foreground text-base">{info.name}</h4>
                        {isEvm && (
                          <span className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-extrabold tracking-wider uppercase">
                            EVM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{info.chain}</p>
                    </div>
                  </div>
                  
                  {hasAddress && (
                    <button 
                      onClick={() => setActiveQrModal({ address, network })}
                      className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Supported Assets */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Supports:</span>
                  <div className="flex flex-wrap gap-1">
                    {info.assets.map(asset => (
                      <div key={asset} className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md border border-border">
                        <TokenIconComponent asset={asset} size={12} />
                        <span className="text-[10px] font-bold text-foreground">{asset}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address */}
              {hasAddress ? (
                <div className="space-y-3 mt-2">
                  <div className="p-3 bg-muted/70 rounded-xl font-mono text-[11px] break-all text-foreground border border-border">
                    {address}
                  </div>
                  <div className="grid grid-cols-1">
                    <button
                      onClick={() => handleCopy(address, network)}
                      className="w-full py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
                    >
                      {copiedAddress === network ? (
                        <><Check className="w-3.5 h-3.5" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Address</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/40 rounded-xl text-center mt-2">
                  <Wallet className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">Address not provisioned</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Warning Alert */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4"
      >
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-sm">Security Advisory</h4>
          <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-1 leading-relaxed">
            <li>Deposits sent to incorrect network addresses cannot be automatically swept by the system.</li>
            <li>Before conducting sweeps, ensure you have sufficient native gas in the master pool wallets.</li>
          </ul>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {activeQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveQrModal(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <NetworkIconComponent network={activeQrModal.network} size={20} />
                  <span className="font-extrabold text-foreground text-sm">
                    {NETWORK_INFO[activeQrModal.network].name} QR Code
                  </span>
                </div>
                <button 
                  onClick={() => setActiveQrModal(null)}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-lg inline-flex items-center justify-center">
                <QRCodeSVG value={activeQrModal.address} size={180} level="H" includeMargin={false} fgColor="#000000" bgColor="#ffffff" />
              </div>

              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Address</span>
                <p className="p-3 bg-muted rounded-xl font-mono text-xs break-all border border-border text-foreground select-all">
                  {activeQrModal.address}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
