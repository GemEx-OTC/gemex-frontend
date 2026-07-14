"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  Zap, 
  History, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Database,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Copy,
  UserCheck
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getSweepStats, getSweepHistory, triggerSweep, syncSweepStats } from "@/lib/api/admin"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/clipboard"

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md bg-muted hover:bg-muted-foreground/10 border border-border hover:border-emerald-500/50 transition-all group shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground group-hover:text-emerald-500" />
      )}
    </button>
  )
}

export default function SweepPage() {
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sweeping, setSweeping] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [statsData, historyData] = await Promise.all([
        getSweepStats(),
        getSweepHistory({ page, limit: 20 })
      ])
      
      setStats(statsData)
      setHistory(historyData.history || [])
      setTotal(historyData.pagination?.total || 0)
    } catch (error) {
      console.error("Failed to fetch sweep data:", error)
      toast.error("Failed to load sweep data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTriggerSweep = async (network: string) => {
    setSweeping(network)
    try {
      await triggerSweep(network)
      toast.success(`${network} sweep process initiated`)
      fetchData(true)
    } catch (error: any) {
      toast.error(error.message || `Failed to trigger ${network} sweep`)
    } finally {
      setSweeping(null)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncSweepStats()
      toast.success(`Sync complete: Audited ${result.audited} wallets, reconciled ${result.reconciled} records.`)
      fetchData(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to sync with blockchain")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Crypto Sweep</h1>
          <p className="text-muted-foreground font-medium text-sm">Manage and consolidate crypto funds from guest wallets</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-3 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-semibold animate-pulse">Syncing sweep data...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-primary/5 to-card border-2 border-indigo-500/25 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="relative">
                <p className="text-xs font-black uppercase text-indigo-500/80 tracking-[0.2em] mb-4">Total Awaiting</p>
                <h3 className="text-5xl font-black text-foreground mb-2">
                  {stats?.unsweptCount || 0}
                </h3>
                <p className="text-sm text-indigo-500/70 font-semibold">Pending blockchain consolidations</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[2rem] bg-card border border-border shadow-lg md:col-span-1 lg:col-span-2 flex flex-col justify-between"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Pending Assets</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || !stats}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border font-bold text-xs hover:bg-secondary/80 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Sync
                  </button>

                  <button
                    onClick={() => handleTriggerSweep('BSC')}
                    disabled={!!sweeping || !stats}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center gap-2"
                  >
                    {sweeping === 'BSC' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    Sweep BSC
                  </button>

                  <button
                    onClick={() => handleTriggerSweep('TRC20')}
                    disabled={!!sweeping || !stats}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs shadow-xl shadow-red-500/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center gap-2"
                  >
                    {sweeping === 'TRC20' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    Sweep Tron
                  </button>

                  <button
                    onClick={() => handleTriggerSweep('BTC')}
                    disabled={!!sweeping || !stats}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-xs shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center gap-2"
                  >
                    {sweeping === 'BTC' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    )}
                    Sweep BTC
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats?.stats && Object.keys(stats.stats).length > 0 ? (
                  Object.entries(stats.stats).map(([key, stat]: [string, any], i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{key.split('-')[0]}</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-foreground leading-none mb-1">{stat.amount.toFixed(4)}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{key.split('-')[1]} • {stat.count} TX</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-6 flex items-center justify-center text-muted-foreground gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="font-bold text-sm">All vaults are empty!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {stats?.wallets && stats.wallets.length > 0 && (
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-lg">
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Wallets Awaiting Sweep</h2>
                </div>
                <div className="px-3 py-1 rounded-xl bg-muted border border-border">
                  <span className="text-xs font-bold text-muted-foreground">
                    <span className="text-emerald-500 font-extrabold">{stats.wallets.length}</span> WALLETS
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Merchant / Type</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asset Network</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hot Wallet</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.wallets.map((wallet: any, idx: number) => (
                      <motion.tr
                        key={wallet.transactionId + '-' + idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-muted/30 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-foreground text-sm">{wallet.merchantName}</span>
                            <span className={`text-[10px] font-black uppercase ${wallet.accountType === 'enterprise' ? 'text-amber-500' : 'text-blue-500'}`}>
                              {wallet.accountType || 'Merchant'} • {wallet.transactionCount} TX
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-[10px] text-foreground group-hover:border-primary/30 transition-colors">
                              {wallet.asset.substring(0, 3)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-foreground text-xs whitespace-nowrap">{wallet.asset}</span>
                              <span className={`text-[10px] font-black uppercase ${wallet.network === 'BSC' ? 'text-yellow-500' : ['BTC', 'BTCTEST'].includes(wallet.network) ? 'text-orange-500' : 'text-red-500'}`}>{wallet.network}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-muted border border-border">
                              <Database className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400/90 truncate max-w-[200px]">
                              {wallet.hotWallet}
                            </span>
                            <CopyButton text={wallet.hotWallet} />
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-foreground mb-1">
                              {wallet.amount.toFixed(6)}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                              {formatDistanceToNow(new Date(wallet.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-lg">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <History className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight">Audit Trail</h2>
              </div>
              <div className="px-3 py-1 rounded-xl bg-muted border border-border">
                <span className="text-xs font-bold text-muted-foreground">
                  <span className="text-amber-500 font-extrabold">{total}</span> COMPLETED SWEEPS
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                <Zap className="w-16 h-16 text-muted-foreground mb-6" />
                <p className="text-lg font-bold text-muted-foreground">No history found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Asset Network</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Transaction Details</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Blockchain ID</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-muted/30 transition-all group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-xs text-foreground group-hover:border-primary/30 transition-colors">
                              {item.asset.substring(0, 3)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-foreground text-sm">{item.asset}</span>
                              <span className={`text-[10px] font-black uppercase ${item.network === 'BSC' ? 'text-yellow-500' : ['BTC', 'BTCTEST'].includes(item.network) ? 'text-orange-500' : 'text-red-500'}`}>{item.network}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-foreground text-base mb-1">{item.amount.toFixed(6)}</span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                              <span className="truncate max-w-[150px]">{item.address}</span>
                              <CopyButton text={item.address} />
                              <ArrowRight className="w-3 h-3 text-emerald-500" />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate max-w-[200px]">
                              {item.txId}
                            </span>
                            <CopyButton text={item.txId} />
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-foreground mb-1">
                              {formatDistanceToNow(new Date(item.sweptAt), { addSuffix: true })}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                              {new Date(item.sweptAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {total > 20 && (
              <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-muted/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Page <span className="text-foreground font-black">{page}</span> of {Math.ceil(total / 20)}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
