"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import Image from "next/image"

import { useTrades, useTradeStats } from "@/lib/hooks/use-trades"
import { TRANSACTION_STATUS } from "@/lib/constants"
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  Banknote,
  Search,
  Filter,
  ExternalLink,
  ArrowDownRight,
  Copy,
  Check
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
  if (asset === 'BTC') {
    return `${amount.toFixed(8)} ${asset}`
  }
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${asset}`
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
    case 'BTC': return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: '₿', logo: '/icons/btc.svg', gradient: 'from-orange-500/20 to-amber-500/10' }
    case 'USDT': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: '₮', logo: '/icons/usdt.svg', gradient: 'from-emerald-500/20 to-green-500/10' }
    case 'USDC': return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: '$', logo: '/icons/usdc.svg', gradient: 'from-blue-500/20 to-cyan-500/10' }
    default: return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: '?', logo: null, gradient: 'from-gray-500/20 to-slate-500/10' }
  }
}


const getStatusGradient = (status: string) => {
  switch (status) {
    case 'Settled': return 'from-emerald-500/10 to-green-500/5 border-emerald-500/30'
    case 'Failed': return 'from-red-500/10 to-rose-500/5 border-red-500/30'
    case 'PayoutPending': return 'from-purple-500/10 to-violet-500/5 border-purple-500/30'
    case 'CryptoConfirmed': return 'from-green-500/10 to-emerald-500/5 border-green-500/30'
    case 'AwaitingDeposit': return 'from-amber-500/10 to-yellow-500/5 border-amber-500/30'
    case 'CryptoMempool': return 'from-amber-500/15 to-yellow-500/10 border-amber-500/40'
    default: return 'from-slate-500/10 to-gray-500/5 border-slate-500/30'
  }
}

type StatusFilter = 'all' | 'AwaitingDeposit' | 'CryptoMempool' | 'CryptoConfirmed' | 'PayoutPending' | 'Settled' | 'Failed'

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const limit = 10

  const { data: tradesData, isLoading, error, refetch } = useTrades({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit,
  })

  const { data: stats } = useTradeStats()

  const handleCopyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const filteredTrades = tradesData?.transactions.filter(trade => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return trade.transactionId.toLowerCase().includes(query)
  }) || []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader title="Trade History" subtitle="View all your completed and pending trades" />

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
            <span className="text-xs font-medium text-emerald-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.settledTrades?.toLocaleString() || 0}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.pendingTrades?.toLocaleString() || 0}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-2 border-cyan-500/40">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">Total Received</span>
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
                placeholder="Search by transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
              {([
                { value: 'all', label: 'All Trades' },
                { value: 'Settled', label: 'Completed' },
                { value: 'PayoutPending', label: 'Payout Pending' },
                { value: 'CryptoConfirmed', label: 'Confirmed' },
                { value: 'CryptoMempool', label: 'Pending Confirmation' },
                { value: 'AwaitingDeposit', label: 'Awaiting Deposit' },
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
          <p className="text-muted-foreground">Loading your trade history...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium mb-2">Failed to load trade history</p>
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
              <motion.div key="trades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {filteredTrades.map((trade, idx) => {
                  const statusInfo = TRANSACTION_STATUS[trade.status as keyof typeof TRANSACTION_STATUS]
                  const cryptoConfig = getCryptoConfig(trade.cryptoAsset)
                  const statusGradient = getStatusGradient(trade.status)
                  
                  return (
                    <motion.div
                      key={trade._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-5 rounded-xl bg-gradient-to-br ${statusGradient} border-2 hover:shadow-lg transition-all`}
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cryptoConfig.gradient} ${cryptoConfig.border} border-2 flex items-center justify-center p-2.5`}>
                            {cryptoConfig.logo ? (
                              <Image
                                src={cryptoConfig.logo}
                                alt={trade.cryptoAsset}
                                width={26}
                                height={26}
                                className="object-contain"
                              />
                            ) : (
                              <span className={`text-xl font-bold ${cryptoConfig.color}`}>{cryptoConfig.icon}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-primary font-bold">{trade.transactionId}</span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${statusInfo?.bg} ${statusInfo?.color}`}>
                                {getStatusIcon(trade.status)}
                                <span>{statusInfo?.label}</span>
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(trade.createdAt), 'MMMM d, yyyy')} at {format(new Date(trade.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Trade Flow Visualization */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                        {/* Crypto Sent */}
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">You Sent</p>
                          <p className={`text-xl sm:text-2xl font-bold ${cryptoConfig.color}`}>
                            {formatCrypto(trade.cryptoAmount, trade.cryptoAsset)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{trade.cryptoNetwork}</p>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <ArrowDownRight className="w-5 h-5 text-primary rotate-0 sm:-rotate-90" />
                          </div>
                        </div>
                        
                        {/* Naira Received */}
                        <div className="flex-1 text-center sm:text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">You Receive</p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                            {formatNaira(trade.nairaAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rate: {formatNaira(trade.rate)}/{trade.cryptoAsset === 'BTC' ? 'BTC' : '1'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Details */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Deposit Address */}
                        {trade.depositAddress && trade.status === 'AwaitingDeposit' && (
                          <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Deposit Address</p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-foreground font-mono flex-1 truncate">{trade.depositAddress}</code>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCopyAddress(trade.depositAddress)}
                                className="p-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                              >
                                {copiedAddress === trade.depositAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </motion.button>
                            </div>
                          </div>
                        )}
                        
                        {/* Bank Account */}
                        {trade.payoutAccountName && (
                          <div className="p-3 rounded-lg bg-background/30 border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payout Account</p>
                            <p className="text-sm font-medium text-foreground">{trade.payoutAccountName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{trade.payoutAccountNumber}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Transaction Hash */}
                      {(trade.cryptoTxId || trade.cryptoTxHash) && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Blockchain TX:</span>
                          <a 
                            href={getExplorerLink((trade.cryptoTxId || trade.cryptoTxHash)!, trade.cryptoNetwork)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1"
                          >
                            {(trade.cryptoTxId || trade.cryptoTxHash)!.slice(0, 12)}...{(trade.cryptoTxId || trade.cryptoTxHash)!.slice(-8)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      
                      {/* Completion timestamps */}
                      {(trade.depositConfirmedAt || trade.payoutCompletedAt) && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {trade.depositConfirmedAt && (
                            <span>Deposit confirmed: {format(new Date(trade.depositConfirmedAt), 'MMM d, h:mm a')}</span>
                          )}
                          {trade.payoutCompletedAt && (
                            <span>Payout completed: {format(new Date(trade.payoutCompletedAt), 'MMM d, h:mm a')}</span>
                          )}
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
                {(searchQuery || statusFilter !== 'all') ? (
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Start trading to see your history here</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {tradesData.pagination.pages > 1 && (
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{((page - 1) * limit) + 1}</span> to{' '}
                <span className="font-medium text-foreground">{Math.min(page * limit, tradesData.pagination.total)}</span> of{' '}
                <span className="font-medium text-foreground">{tradesData.pagination.total}</span> trades
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
                
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, tradesData.pagination.pages) }, (_, i) => {
                    let pageNum: number
                    const totalPages = tradesData.pagination.pages
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>
                
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
