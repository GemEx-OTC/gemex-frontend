"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { useTrades, useTradeStats, useTriggerPayout } from "@/lib/hooks/use-trades"
import { TRANSACTION_STATUS } from "@/lib/constants"
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  Users,
  Banknote,
  Search,
  Filter,
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatCrypto = (amount: number, asset: string) => {
  const decimals = asset === 'BTC' ? 8 : 2
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })} ${asset}`
}

const getExplorerLink = (txId: string, network: string): string => {
  const isTest = process.env.NODE_ENV !== 'production';
  switch (network) {
    case 'BTC':
      return isTest 
        ? `https://blockstream.info/testnet/tx/${txId}` 
        : `https://blockstream.info/tx/${txId}`;
    case 'BSC':
      return isTest 
        ? `https://testnet.bscscan.com/tx/${txId}` 
        : `https://bscscan.com/tx/${txId}`;
    case 'ETH':
      return isTest 
        ? `https://sepolia.etherscan.io/tx/${txId}` 
        : `https://etherscan.io/tx/${txId}`;
    case 'BASE':
      return isTest 
        ? `https://sepolia.basescan.org/tx/${txId}` 
        : `https://basescan.org/tx/${txId}`;
    case 'POLYGON':
      return isTest 
        ? `https://amoy.polygonscan.com/tx/${txId}` 
        : `https://polygonscan.com/tx/${txId}`;
    case 'ARBITRUM':
      return isTest 
        ? `https://sepolia.arbiscan.io/tx/${txId}` 
        : `https://arbiscan.io/tx/${txId}`;
    case 'OPTIMISM':
      return isTest 
        ? `https://sepolia-optimism.etherscan.io/tx/${txId}` 
        : `https://optimistic.etherscan.io/tx/${txId}`;
    case 'TRON':
    case 'TRC20':
    default:
      return isTest 
        ? `https://shasta.tronscan.org/#/transaction/${txId}` 
        : `https://tronscan.org/#/transaction/${txId}`;
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Settled': return <CheckCircle2 className="w-4 h-4" />
    case 'Failed': return <XCircle className="w-4 h-4" />
    case 'PayoutPending': return <Banknote className="w-4 h-4" />
    case 'CryptoConfirmed': return <Wallet className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

const getCryptoConfig = (asset: string) => {
  switch (asset) {
    case 'BTC': return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: '₿' }
    case 'USDT': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: '₮' }
    case 'USDC': return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: '$' }
    default: return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: '?' }
  }
}

type StatusFilter = 'all' | 'AwaitingDeposit' | 'CryptoMempool' | 'CryptoConfirmed' | 'PayoutPending' | 'Settled' | 'Failed'

export default function DealerTradesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  const { data: tradesData, isLoading, error, refetch } = useTrades({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit,
  })

  const { data: stats } = useTradeStats()
  const triggerPayout = useTriggerPayout()

  const handleTriggerPayout = async (tradeId: string) => {
    if (confirm('Are you sure you want to initiate the payout for this trade?')) {
      try {
        await triggerPayout.mutateAsync(tradeId)
      } catch (err) {
        console.error('Failed to trigger payout:', err)
      }
    }
  }

  const filteredTrades = tradesData?.transactions.filter(trade => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      trade.transactionId.toLowerCase().includes(query) ||
      trade.clientId?.fullName?.toLowerCase().includes(query) ||
      trade.clientId?.email?.toLowerCase().includes(query)
    )
  }) || []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader title="Trade Processing" subtitle="Monitor and manage active and completed trades" />

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-2 border-indigo-500/40">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">Total Trades</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalTrades?.toLocaleString() || 0}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-2 border-emerald-500/40">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Settled</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.settledTrades?.toLocaleString() || 0}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.pendingTrades?.toLocaleString() || 0}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-2 border-cyan-500/40">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">Total Volume</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatNaira(stats?.totalVolume || 0)}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by transaction ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
              {([
                { value: 'all', label: 'All' },
                { value: 'CryptoConfirmed', label: 'Ready for Payout' },
                { value: 'PayoutPending', label: 'Payout Pending' },
                { value: 'CryptoMempool', label: 'Pending Confirmation' },
                { value: 'AwaitingDeposit', label: 'Awaiting Deposit' },
                { value: 'Settled', label: 'Settled' },
                { value: 'Failed', label: 'Failed' },
              ] as const).map((filter) => {
                const isActive = statusFilter === filter.value
                const statusInfo = filter.value !== 'all' ? TRANSACTION_STATUS[filter.value] : null
                
                return (
                  <motion.button
                    key={filter.value}
                    onClick={() => { setStatusFilter(filter.value); setPage(1); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all border whitespace-nowrap ${
                      isActive 
                        ? filter.value === 'all'
                          ? "bg-primary text-primary-foreground border-primary"
                          : `${statusInfo?.bg} ${statusInfo?.color} border-current/30`
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {filter.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading trades...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium mb-2">Failed to load trades</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Trades List */}
      {!isLoading && !error && tradesData && (
        <>
          <AnimatePresence mode="wait">
            {filteredTrades.length > 0 ? (
              <motion.div key="trades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {filteredTrades.map((trade, idx) => {
                  const statusInfo = TRANSACTION_STATUS[trade.status as keyof typeof TRANSACTION_STATUS]
                  const cryptoConfig = getCryptoConfig(trade.cryptoAsset)
                  const canTriggerPayout = trade.status === 'CryptoConfirmed' || trade.status === 'Failed'
                  
                  return (
                    <motion.div
                      key={trade._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 sm:p-5 rounded-xl bg-card border-2 border-border hover:border-primary/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cryptoConfig.bg} ${cryptoConfig.border} border flex items-center justify-center`}>
                            <span className={`text-lg font-bold ${cryptoConfig.color}`}>{cryptoConfig.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-primary font-bold text-sm sm:text-base">{trade.transactionId}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1 ${statusInfo?.bg} ${statusInfo?.color}`}>
                                {getStatusIcon(trade.status)}
                                <span>{statusInfo?.label}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{trade.clientId?.fullName || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                          </div>
                          <div className="text-xs text-muted-foreground/70 mt-0.5">
                            {format(new Date(trade.createdAt), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Crypto Sent</span>
                          <p className={`text-lg font-bold mt-1 ${cryptoConfig.color}`}>
                            {formatCrypto(trade.cryptoAmount, trade.cryptoAsset)}
                          </p>
                          <span className="text-xs text-muted-foreground">{trade.cryptoNetwork}</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Naira Payout</span>
                          <p className="text-lg font-bold text-emerald-400 mt-1">{formatNaira(trade.nairaAmount)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</span>
                          <p className="text-base font-semibold text-foreground mt-1">
                            {formatNaira(trade.rate)}<span className="text-xs text-muted-foreground">/{trade.cryptoAsset === 'BTC' ? 'BTC' : '1'}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payout To</span>
                          <p className="text-sm font-medium text-foreground mt-1 truncate">{trade.payoutAccountName}</p>
                          <span className="text-xs text-muted-foreground font-mono">{trade.payoutAccountNumber}</span>
                        </div>
                      </div>
                      
                      {canTriggerPayout && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleTriggerPayout(trade._id)}
                            disabled={triggerPayout.isPending}
                            className={`flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-lg disabled:opacity-50 ${
                              trade.status === 'Failed'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                : 'bg-gradient-to-r from-emerald-500 to-green-600'
                            }`}
                          >
                            {triggerPayout.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : trade.status === 'Failed' ? (
                              <RefreshCw className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                            {trade.status === 'Failed' ? 'Retry Payout' : 'Initiate Payout'}
                          </motion.button>
                        </div>
                      )}
                      
                      {(trade.cryptoTxId || trade.cryptoTxHash) && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">TX Hash: </span>
                          <a href={getExplorerLink((trade.cryptoTxId || trade.cryptoTxHash)!, trade.cryptoNetwork)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1">
                            {(trade.cryptoTxId || trade.cryptoTxHash)!.slice(0, 16)}...{(trade.cryptoTxId || trade.cryptoTxHash)!.slice(-8)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">No trades found</p>
                {(searchQuery || statusFilter !== 'all') && (
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {tradesData.pagination.pages > 1 && (
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page} of {tradesData.pagination.pages} ({tradesData.pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.min(tradesData.pagination.pages, p + 1))}
                  disabled={page === tradesData.pagination.pages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 hover:border-primary/50 transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
