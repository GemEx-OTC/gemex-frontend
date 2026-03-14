"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  Droplets, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

// Types
interface LiquidityBalance {
  availableBalance: number
  ledgerBalance: number
  currency: string
}

interface Disbursement {
  id: string
  reference: string
  sourceReference: string
  source: "OTC" | "RAILS"
  amount: number
  fee: number
  destinationBankName: string
  destinationAccountNumber: string
  destinationAccountName: string
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED"
  createdAt: string
  completedAt?: string
}

interface LiquidityStats {
  pendingPayouts: number
  totalDisbursedOTC: number
  totalDisbursedRails: number
  successCount: number
  failedCount: number
  pendingCount: number
}

// API functions
const OTC_API_URL = process.env.NEXT_PUBLIC_OTC_API_URL || "http://localhost:4000"

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const fetchBalance = async (): Promise<LiquidityBalance> => {
  const res = await fetch(`${OTC_API_URL}/api/v1/liquidity/balance`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch balance")
  const data = await res.json()
  return data.data
}

const fetchDisbursements = async (page = 1, limit = 10): Promise<{ disbursements: Disbursement[], pagination: { total: number } }> => {
  const res = await fetch(`${OTC_API_URL}/api/v1/liquidity/disbursements?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch disbursements")
  const data = await res.json()
  return data.data
}

const fetchStats = async (): Promise<LiquidityStats> => {
  const res = await fetch(`${OTC_API_URL}/api/v1/liquidity/stats`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch stats")
  const data = await res.json()
  return data.data
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Success" }
    case "FAILED":
      return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Failed" }
    case "PROCESSING":
      return { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Processing" }
    default:
      return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" }
  }
}

const getSourceBadge = (source: string) => {
  return source === "OTC" 
    ? { color: "text-purple-500", bg: "bg-purple-500/10", label: "OTC" }
    : { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Rails" }
}

export default function LiquidityPage() {
  const [page, setPage] = useState(1)

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["liquidity-balance"],
    queryFn: fetchBalance,
    refetchInterval: 30000,
  })

  const { data: disbursementsData, isLoading: disbursementsLoading } = useQuery({
    queryKey: ["disbursements", page],
    queryFn: () => fetchDisbursements(page, 10),
  })

  const disbursements = disbursementsData?.disbursements || []
  const total = disbursementsData?.pagination?.total || 0

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["liquidity-stats"],
    queryFn: fetchStats,
    refetchInterval: 60000,
  })

  const isLoading = balanceLoading || statsLoading

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader 
        title="Liquidity Center" 
        subtitle="Monitor platform liquidity and payout history"
        action={{
          label: "Refresh",
          onClick: () => refetchBalance(),
        }}
      />

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/40"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Available Balance</span>
            </div>
            {balanceLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          </div>
          <p className="text-3xl font-bold text-foreground">
            {balance ? formatCurrency(balance.availableBalance) : "—"}
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Ready for payouts</p>
        </motion.div>

        {/* Pending Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Payouts</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats ? formatCurrency(stats.pendingPayouts) : "—"}
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{stats?.pendingCount || 0} awaiting payout</p>
        </motion.div>

        {/* OTC Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">OTC Payouts</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats ? formatCurrency(stats.totalDisbursedOTC) : "—"}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">From GemOTC</p>
        </motion.div>

        {/* Rails Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownRight className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Rails Payouts</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats ? formatCurrency(stats.totalDisbursedRails) : "—"}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">From GemOTC Rails</p>
        </motion.div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.successCount || 0}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.pendingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats?.failedCount || 0}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Payout History</h2>
          <button
            onClick={() => refetchBalance()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {disbursementsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : disbursements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Droplets className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payouts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {disbursements.map((disbursement, idx) => {
              const statusBadge = getStatusBadge(disbursement.status)
              const sourceBadge = getSourceBadge(disbursement.source)
              const StatusIcon = statusBadge.icon

              return (
                <motion.div
                  key={disbursement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">{disbursement.destinationAccountName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadge.bg} ${sourceBadge.color}`}>
                            {sourceBadge.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {disbursement.destinationBankName} • {disbursement.destinationAccountNumber}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(disbursement.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground">{formatCurrency(disbursement.amount)}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color} mt-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= total}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
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
