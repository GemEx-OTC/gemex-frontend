"use client"

import { useState } from "react"
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
  Menu
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

// Types
interface SweepStat {
  network: string
  asset: string
  amount: number
  count: number
}

interface SweepStatsResponse {
  unsweptCount: number
  stats: SweepStat[]
}

interface SweepHistoryItem {
  id: string
  address: string
  asset: string
  network: string
  amount: number
  txId: string
  sweptAt: string
}

interface SweepHistoryResponse {
  history: SweepHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// API functions
const OTC_API_URL = process.env.NEXT_PUBLIC_OTC_API_URL || "http://localhost:4000"

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const fetchSweepStats = async (): Promise<SweepStatsResponse> => {
  const res = await fetch(`${OTC_API_URL}/api/v1/admin/sweep/stats`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch sweep stats")
  const data = await res.json()
  return data.data
}

const fetchSweepHistory = async (page = 1, limit = 50): Promise<SweepHistoryResponse> => {
  const res = await fetch(`${OTC_API_URL}/api/v1/admin/sweep/history?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch sweep history")
  const data = await res.json()
  return data.data
}

const triggerSweep = async () => {
  const res = await fetch(`${OTC_API_URL}/api/v1/admin/sweep/trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to trigger sweep")
  }
  return res.json()
}

export default function SweepPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["sweep-stats"],
    queryFn: fetchSweepStats,
    refetchInterval: 30000,
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["sweep-history", page],
    queryFn: () => fetchSweepHistory(page, 20),
  })

  const sweepMutation = useMutation({
    mutationFn: triggerSweep,
    onSuccess: () => {
      toast.success("Sweep process initiated successfully")
      queryClient.invalidateQueries({ queryKey: ["sweep-stats"] })
      queryClient.invalidateQueries({ queryKey: ["sweep-history"] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const history = historyData?.history || []
  const total = historyData?.pagination?.total || 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-8">
      <DashboardHeader 
        title="Crypto Sweep Management" 
        subtitle="Consolidate funds from deposit wallets to the revenue account"
        action={{
          label: "Refresh Stats",
          onClick: () => refetchStats(),
        }}
      />

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20">
              <Database className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500/60">Total Unswept</span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl font-black text-foreground">
              {statsLoading ? "..." : stats?.unsweptCount || 0}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Unique transactions awaiting sweep</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-card border border-border shadow-xl md:col-span-1 lg:col-span-2 overflow-hidden relative group"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Unswept Assets</h3>
            </div>
            
            <button
              onClick={() => sweepMutation.mutate()}
              disabled={sweepMutation.isPending || !stats || stats.unsweptCount === 0}
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center gap-2"
            >
              {sweepMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-current" />
              )}
              Trigger Batch Sweep
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
              ))
            ) : stats?.stats && stats.stats.length > 0 ? (
              stats.stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border/50 group-hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-muted-foreground uppercase">{stat.network}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{stat.count} TXs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold leading-tight">{stat.amount.toFixed(4)}</span>
                    <span className="text-xs font-medium text-muted-foreground">{stat.asset}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p className="font-bold">Everything swept!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <History className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-foreground">Sweep History</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground px-3 py-1 rounded-full bg-muted">
              {total} Total Sweeps
            </span>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading sweep logs...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center grayscale opacity-60">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-1">No sweep history yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Once you trigger a sweep process, the logs will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Asset & Network</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount & Address</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Transaction ID</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-xs">
                          {item.asset.substring(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.asset}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase">{item.network}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-foreground">{item.amount.toFixed(6)}</span>
                        <div className="flex items-center gap-1.5 opacity-50 text-[10px] font-mono group-hover:opacity-100 transition-opacity">
                          <span className="truncate max-w-[120px]">{item.address}</span>
                          <ArrowRight className="w-2 h-2" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 items-center justify-center flex">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                          {item.txId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-foreground">
                          {formatDistanceToNow(new Date(item.sweptAt), { addSuffix: true })}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {new Date(item.sweptAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-muted/10">
            <p className="text-sm font-medium text-muted-foreground">
              Showing <span className="text-foreground font-bold">{((page - 1) * 20) + 1}</span> - <span className="text-foreground font-bold">{Math.min(page * 20, total)}</span> of <span className="text-foreground font-bold">{total}</span> entries
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
