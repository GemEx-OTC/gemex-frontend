"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  UserX, UserCheck, Eye, X, Shield, Mail, Calendar, 
  TrendingUp, BanknoteIcon, User, Loader2, AlertTriangle, 
  Wallet, History, FileText, ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  useUsers, 
  useUserDetails,
  useSuspendUser, 
  useReactivateUser,
  useCreateUserWallets,
} from "@/lib/hooks/use-admin"
import type { ListUsersQuery, UserListItem } from "@/lib/api/admin"

type DetailsTab = "overview" | "transactions" | "activity"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [kycFilter, setKycFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("overview")
  const [suspendReason, setSuspendReason] = useState("")
  const [confirmText, setConfirmText] = useState("")

  // Build query
  const query: ListUsersQuery = {
    page,
    limit: 20,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? (statusFilter as "active" | "inactive") : undefined,
    kycStatus: kycFilter !== "all" ? (kycFilter as any) : undefined,
    role: "client",
  }

  const { data, isLoading, error } = useUsers(query)
  const { data: userDetails, isLoading: detailsLoading } = useUserDetails(selectedUserId || "")
  const suspendMutation = useSuspendUser()
  const reactivateMutation = useReactivateUser()
  const createWalletsMutation = useCreateUserWallets()

  // Get active filter count for badge
  const activeFilters = [statusFilter, kycFilter].filter(f => f !== "all").length

  const handleViewDetails = (user: UserListItem) => {
    setSelectedUserId(user.id)
    setDetailsTab("overview")
    setShowDetailsModal(true)
  }

  const handleSuspendClick = (user: UserListItem) => {
    setSelectedUserId(user.id)
    setShowSuspendModal(true)
    setSuspendReason("")
    setConfirmText("")
  }

  const handleReactivateClick = (user: UserListItem) => {
    setSelectedUserId(user.id)
    setShowReactivateModal(true)
    setConfirmText("")
  }

  const handleConfirmSuspend = async () => {
    if (confirmText !== "SUSPEND") {
      toast.error("Please type SUSPEND to confirm")
      return
    }
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension")
      return
    }
    try {
      await suspendMutation.mutateAsync({ id: selectedUserId!, reason: suspendReason })
      toast.success("User suspended successfully")
      setShowSuspendModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend user")
    }
  }

  const handleConfirmReactivate = async () => {
    if (confirmText !== "REACTIVATE") {
      toast.error("Please type REACTIVATE to confirm")
      return
    }
    try {
      await reactivateMutation.mutateAsync(selectedUserId!)
      toast.success("User reactivated successfully")
      setShowReactivateModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate user")
    }
  }

  const handleCreateWallets = async () => {
    if (!selectedUserId) return
    try {
      const result = await createWalletsMutation.mutateAsync(selectedUserId)
      toast.success(result.created ? "Wallets created successfully" : result.message)
    } catch (err: any) {
      toast.error(err.message || "Failed to create wallets")
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  const getStatusStyle = (status: string) => {
    if (status === "Settled") return "bg-emerald-500/20 text-emerald-300"
    if (status === "Failed") return "bg-red-500/20 text-red-300"
    if (status.includes("Pending") || status.includes("Awaiting")) return "bg-amber-500/20 text-amber-300"
    return "bg-blue-500/20 text-blue-300"
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="User Management" subtitle="Monitor and manage client accounts" />

      {/* Search and Filter - Simplified */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg transition-all focus:outline-none"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeFilters > 0 
                  ? "bg-[#641AE4]/20 border-[#641AE4] text-[#A78BFA]" 
                  : "bg-[#2D2D3D] border-[#3D3D4D] text-[#B0B0B8] hover:text-[#F0F0F0]"
              }`}
            >
              <Shield className="w-4 h-4" />
              Filters {activeFilters > 0 && <span className="bg-[#641AE4] text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilters}</span>}
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-64 bg-[#1E1E2B] border border-[#3D3D4D] rounded-lg shadow-xl z-20 p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#808090] uppercase tracking-wide mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="w-full bg-[#2D2D3D] border border-[#3D3D4D] text-[#F0F0F0] px-3 py-2 rounded-lg focus:outline-none focus:border-[#641AE4]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#808090] uppercase tracking-wide mb-2 block">KYC Status</label>
                    <select
                      value={kycFilter}
                      onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
                      className="w-full bg-[#2D2D3D] border border-[#3D3D4D] text-[#F0F0F0] px-3 py-2 rounded-lg focus:outline-none focus:border-[#641AE4]"
                    >
                      <option value="all">All KYC</option>
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setStatusFilter("all"); setKycFilter("all"); setPage(1); }}
                      className="w-full text-sm text-[#808090] hover:text-[#F0F0F0] py-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Click outside to close filter */}
      {filterOpen && <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />}

      {/* Loading/Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#641AE4]" />
        </div>
      )}
      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Failed to load users</p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && data && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#3D3D4D] scrollbar-track-transparent">
              <div className="bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg overflow-hidden inline-block min-w-full">
                <table className="min-w-[640px] w-full">
                <thead>
                  <tr className="border-b border-[#2D2D3D] bg-[#2D2D3D]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">KYC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-[#F0F0F0] font-medium">{user.fullName}</div>
                        <div className="text-[#808090] text-sm">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                        }`}>
                          {user.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.kycStatus === "Verified" ? "bg-emerald-500/20 text-emerald-300"
                            : user.kycStatus === "Pending" ? "bg-amber-500/20 text-amber-300"
                            : "bg-red-500/20 text-red-300"
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#B0B0B8] text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetails(user)} className="text-xs px-3 py-1.5 rounded bg-[#641AE4]/20 text-[#A78BFA] hover:bg-[#641AE4]/30 transition-all font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {user.isActive ? (
                            <button onClick={() => handleSuspendClick(user)} className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all font-medium flex items-center gap-1">
                              <UserX className="w-3 h-3" /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleReactivateClick(user)} className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all font-medium flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </motion.div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[#808090]">
                Page {page} of {data.pagination.totalPages} ({data.pagination.total} users)
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 text-sm">Previous</button>
                <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages} className="px-3 py-1.5 rounded bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 text-sm">Next</button>
              </div>
            </div>
          )}

          {data.users.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
              <p className="text-[#808090]">No users found</p>
            </div>
          )}
        </>
      )}

      {/* User Details Modal with Tabs */}
      <AnimatePresence>
        {showDetailsModal && selectedUserId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#F0F0F0]">User Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-[#808090] hover:text-[#F0F0F0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#641AE4]" />
                </div>
              ) : userDetails ? (
                <>
                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 border-b border-[#2D2D3D] pb-3">
                    {[
                      { id: "overview", label: "Overview", icon: User },
                      { id: "transactions", label: `Transactions (${userDetails.transactions.length})`, icon: History },
                      { id: "activity", label: `Activity (${userDetails.auditLogs.length})`, icon: FileText },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setDetailsTab(tab.id as DetailsTab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          detailsTab === tab.id 
                            ? "bg-[#641AE4] text-white" 
                            : "text-[#808090] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Overview Tab */}
                    {detailsTab === "overview" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-[#2D2D3D]/50 rounded-lg">
                          <div className="w-14 h-14 rounded-full bg-[#641AE4]/20 flex items-center justify-center">
                            <span className="text-xl font-bold text-[#641AE4]">{userDetails.fullName.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-[#F0F0F0] font-semibold text-lg">{userDetails.fullName}</div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${userDetails.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                {userDetails.isActive ? "Active" : "Suspended"}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${userDetails.kycStatus === "Verified" ? "bg-emerald-500/20 text-emerald-300" : userDetails.kycStatus === "Pending" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}>
                                KYC: {userDetails.kycStatus}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${userDetails.hasWallets ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"}`}>
                                {userDetails.hasWallets ? "Has Wallets" : "No Wallets"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><Mail className="w-4 h-4" />Email</div>
                            <div className="text-[#F0F0F0] text-sm font-medium truncate">{userDetails.email}</div>
                          </div>
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><Calendar className="w-4 h-4" />Joined</div>
                            <div className="text-[#F0F0F0] text-sm font-medium">{formatDate(userDetails.createdAt)}</div>
                          </div>
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><TrendingUp className="w-4 h-4" />Total Trades</div>
                            <div className="text-[#F0F0F0] text-sm font-medium">{userDetails.tradeStats.totalTrades}</div>
                          </div>
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><BanknoteIcon className="w-4 h-4" />Volume</div>
                            <div className="text-emerald-300 text-sm font-medium">{formatCurrency(userDetails.tradeStats.totalVolume)}</div>
                          </div>
                        </div>

                        {userDetails.bankAccount && (
                          <div className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="text-[#808090] text-sm mb-2">Bank Account</div>
                            <div className="text-[#F0F0F0] font-medium">{userDetails.bankAccount.bankName}</div>
                            <div className="text-[#808090] text-sm">{userDetails.bankAccount.accountNumber} - {userDetails.bankAccount.accountName}</div>
                          </div>
                        )}

                        <div className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[#808090] text-sm">Wallets</div>
                            {!userDetails.hasWallets && (
                              <button onClick={handleCreateWallets} disabled={createWalletsMutation.isPending} className="text-xs px-3 py-1.5 rounded bg-[#C8F55A] text-[#1E1E2B] hover:bg-[#B8E54A] font-medium flex items-center gap-1 disabled:opacity-50">
                                {createWalletsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
                                Create Wallets
                              </button>
                            )}
                          </div>
                          {userDetails.wallets.length > 0 ? (
                            <div className="space-y-2">
                              {userDetails.wallets.map((wallet, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-[#A78BFA] font-medium">{wallet.network}</span>
                                  <span className="text-[#808090] font-mono text-xs truncate max-w-[200px]">{wallet.address}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[#808090] text-sm">No wallets created</p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#2D2D3D]">
                          <div className="text-sm font-medium text-[#808090] mb-3">Quick Actions</div>
                          <div className="flex gap-2">
                            {userDetails.isActive ? (
                              <button onClick={() => { setShowDetailsModal(false); handleSuspendClick(userDetails as any); }} className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center gap-2">
                                <UserX className="w-4 h-4" /> Suspend User
                              </button>
                            ) : (
                              <button onClick={() => { setShowDetailsModal(false); handleReactivateClick(userDetails as any); }} className="px-4 py-2 rounded-lg font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" /> Reactivate User
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transactions Tab */}
                    {detailsTab === "transactions" && (
                      <div className="space-y-3">
                        {userDetails.transactions.length > 0 ? (
                          userDetails.transactions.map((txn) => (
                            <div key={txn.id} className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-emerald-300 text-sm font-bold">{txn.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(txn.status)}`}>
                                  {txn.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <div className="text-[#808090] text-xs">Asset</div>
                                  <div className="text-[#F0F0F0] font-medium">{txn.cryptoAmount} {txn.cryptoAsset}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Amount</div>
                                  <div className="text-emerald-300 font-medium">{formatCurrency(txn.nairaAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Rate</div>
                                  <div className="text-[#F0F0F0] font-medium">{formatCurrency(txn.rate)}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Date</div>
                                  <div className="text-[#F0F0F0] font-medium">{formatDate(txn.createdAt)}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <History className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
                            <p className="text-[#808090]">No transactions found</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Activity Tab */}
                    {detailsTab === "activity" && (
                      <div className="space-y-3">
                        {userDetails.auditLogs.length > 0 ? (
                          userDetails.auditLogs.map((log) => (
                            <div key={log.id} className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                  log.severity === "critical" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : log.severity === "warning" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[#808090] text-xs">
                                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-[#E0E0E0] text-sm">{log.details}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-[#808090]">
                                <span>By: {log.actor}</span>
                                {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
                            <p className="text-[#808090]">No activity logs found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              <div className="flex gap-3 mt-4 pt-4 border-t border-[#2D2D3D]">
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-2.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Modal */}
      <AnimatePresence>
        {showSuspendModal && selectedUserId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !suspendMutation.isPending && setShowSuspendModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#1E1E2B] border-2 border-red-500 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <UserX className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Suspend User</h3>
                <p className="text-[#808090]">This will revoke access for this user</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Reason <span className="text-red-400">*</span></label>
                  <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Provide a reason..." rows={3} className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-red-400 text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Type <span className="text-red-400 font-mono">SUSPEND</span> to confirm</label>
                  <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="SUSPEND" className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-red-400 text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg focus:outline-none font-mono" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSuspendModal(false)} disabled={suspendMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmSuspend} disabled={suspendMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {suspendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Suspend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactivate Modal */}
      <AnimatePresence>
        {showReactivateModal && selectedUserId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !reactivateMutation.isPending && setShowReactivateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#1E1E2B] border-2 border-emerald-500 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                  <UserCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Reactivate User</h3>
                <p className="text-[#808090]">Restore access for this user</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Type <span className="text-emerald-400 font-mono">REACTIVATE</span> to confirm</label>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="REACTIVATE" className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-emerald-400 text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg focus:outline-none font-mono" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowReactivateModal(false)} disabled={reactivateMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmReactivate} disabled={reactivateMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {reactivateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Reactivate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
