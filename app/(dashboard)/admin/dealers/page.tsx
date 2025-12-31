"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  Plus, UserCheck, UserX, Eye, X, Key, Mail, Calendar, 
  Shield, User, Loader2, AlertTriangle, ChevronDown,
  TrendingUp, BanknoteIcon, History, FileText
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  useDealers, 
  useDealer,
  useCreateDealer, 
  useSuspendDealer, 
  useReactivateDealer,
  useResetDealerPassword 
} from "@/lib/hooks/use-admin"
import type { Dealer, CreateDealerInput } from "@/lib/api/admin"

type DetailsTab = "overview" | "trades" | "activity"

export default function AdminDealersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null)
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [detailsTab, setDetailsTab] = useState<DetailsTab>("overview")
  const [suspendReason, setSuspendReason] = useState("")
  const [confirmText, setConfirmText] = useState("")

  // Form state for creating dealer
  const [newDealer, setNewDealer] = useState<CreateDealerInput>({
    email: "",
    fullName: "",
    phoneNumber: "",
  })

  // API hooks
  const { data: dealers, isLoading, error } = useDealers()
  const { data: dealerDetails, isLoading: detailsLoading } = useDealer(selectedDealerId || "")
  const createDealerMutation = useCreateDealer()
  const suspendDealerMutation = useSuspendDealer()
  const reactivateDealerMutation = useReactivateDealer()
  const resetPasswordMutation = useResetDealerPassword()

  // Get active filter count
  const activeFilters = statusFilter !== "all" ? 1 : 0

  const filteredDealers = (dealers || []).filter(
    (d) =>
      (statusFilter === "all" || (statusFilter === "active" ? d.isActive : !d.isActive)) &&
      (d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleViewDetails = (dealer: Dealer) => {
    setSelectedDealerId(dealer.id)
    setSelectedDealer(dealer)
    setDetailsTab("overview")
    setShowDetailsModal(true)
  }

  const handleSuspendClick = (dealer: Dealer) => {
    setSelectedDealer(dealer)
    setShowSuspendModal(true)
    setSuspendReason("")
    setConfirmText("")
  }

  const handleReactivateClick = (dealer: Dealer) => {
    setSelectedDealer(dealer)
    setShowReactivateModal(true)
    setConfirmText("")
  }

  const handleResetPasswordClick = (dealer: Dealer) => {
    setSelectedDealer(dealer)
    setShowResetPasswordModal(true)
    setConfirmText("")
  }


  const handleCreateDealer = async () => {
    if (!newDealer.email || !newDealer.fullName) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      await createDealerMutation.mutateAsync(newDealer)
      toast.success("Dealer account created", {
        description: "Login credentials have been sent to their email"
      })
      setShowCreateModal(false)
      setNewDealer({ email: "", fullName: "", phoneNumber: "" })
    } catch (err: any) {
      toast.error(err.message || "Failed to create dealer")
    }
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
      await suspendDealerMutation.mutateAsync({ id: selectedDealer!.id, reason: suspendReason })
      toast.success(`Dealer ${selectedDealer?.fullName} suspended`)
      setShowSuspendModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend dealer")
    }
  }

  const handleConfirmReactivate = async () => {
    if (confirmText !== "REACTIVATE") {
      toast.error("Please type REACTIVATE to confirm")
      return
    }
    try {
      await reactivateDealerMutation.mutateAsync(selectedDealer!.id)
      toast.success(`Dealer ${selectedDealer?.fullName} reactivated`)
      setShowReactivateModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate dealer")
    }
  }

  const handleConfirmResetPassword = async () => {
    if (confirmText !== "RESET") {
      toast.error("Please type RESET to confirm")
      return
    }
    try {
      await resetPasswordMutation.mutateAsync(selectedDealer!.id)
      toast.success("Password reset successful", { description: "New credentials sent to dealer's email" })
      setShowResetPasswordModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
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
      <DashboardHeader 
        title="Dealer Management" 
        subtitle="Create and manage dealer accounts" 
      />

      {/* Search and Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                className="absolute right-0 top-full mt-2 w-56 bg-[#1E1E2B] border border-[#3D3D4D] rounded-lg shadow-xl z-20 p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#808090] uppercase tracking-wide mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-[#2D2D3D] border border-[#3D3D4D] text-[#F0F0F0] px-3 py-2 rounded-lg focus:outline-none focus:border-[#641AE4]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Suspended</option>
                    </select>
                  </div>
                  {activeFilters > 0 && (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="w-full text-sm text-[#808090] hover:text-[#F0F0F0] py-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 rounded-lg font-medium bg-[#C8F55A] text-[#1E1E2B] hover:bg-[#B8E54A] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Dealer
          </motion.button>
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
          <p className="text-red-400">Failed to load dealers</p>
        </div>
      )}

      {/* Dealers Table */}
      {!isLoading && !error && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#3D3D4D] scrollbar-track-transparent">
              <div className="bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg overflow-hidden inline-block min-w-full">
                <table className="min-w-[700px] w-full">
                <thead>
                  <tr className="border-b border-[#2D2D3D] bg-[#2D2D3D]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Dealer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Last Login</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDealers.map((dealer) => (
                    <motion.tr
                      key={dealer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-[#F0F0F0] font-medium">{dealer.fullName}</div>
                        <div className="text-[#808090] text-sm">{dealer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          dealer.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                        }`}>
                          {dealer.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#B0B0B8] text-sm">{dealer.phoneNumber || "—"}</td>
                      <td className="px-6 py-4 text-[#B0B0B8] text-sm">{formatDate(dealer.lastLoginAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetails(dealer)} className="text-xs px-3 py-1.5 rounded bg-[#641AE4]/20 text-[#A78BFA] hover:bg-[#641AE4]/30 transition-all font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button onClick={() => handleResetPasswordClick(dealer)} className="text-xs px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all font-medium flex items-center gap-1">
                            <Key className="w-3 h-3" /> Reset
                          </button>
                          {dealer.isActive ? (
                            <button onClick={() => handleSuspendClick(dealer)} className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all font-medium flex items-center gap-1">
                              <UserX className="w-3 h-3" /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleReactivateClick(dealer)} className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all font-medium flex items-center gap-1">
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

          {filteredDealers.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
              <p className="text-[#808090]">No dealers found</p>
              <p className="text-[#808090] text-sm mt-1">Create your first dealer account to get started</p>
            </div>
          )}
        </>
      )}


      {/* Dealer Details Modal with Tabs */}
      <AnimatePresence>
        {showDetailsModal && selectedDealerId && (
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
                <h3 className="text-xl font-bold text-[#F0F0F0]">Dealer Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-[#808090] hover:text-[#F0F0F0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#641AE4]" />
                </div>
              ) : dealerDetails ? (
                <>
                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 border-b border-[#2D2D3D] pb-3">
                    {[
                      { id: "overview", label: "Overview", icon: User },
                      { id: "trades", label: `Trades (${dealerDetails.trades?.length || 0})`, icon: History },
                      { id: "activity", label: `Activity (${dealerDetails.auditLogs?.length || 0})`, icon: FileText },
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
                            <span className="text-xl font-bold text-[#641AE4]">{dealerDetails.fullName.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-[#F0F0F0] font-semibold text-lg">{dealerDetails.fullName}</div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dealerDetails.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                {dealerDetails.isActive ? "Active" : "Suspended"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#641AE4]/20 text-[#A78BFA]">
                                Dealer
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><Mail className="w-4 h-4" />Email</div>
                            <div className="text-[#F0F0F0] text-sm font-medium truncate">{dealerDetails.email}</div>
                          </div>
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><Calendar className="w-4 h-4" />Joined</div>
                            <div className="text-[#F0F0F0] text-sm font-medium">{formatDate(dealerDetails.createdAt)}</div>
                          </div>
                        </div>

                        {dealerDetails.phoneNumber && (
                          <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                            <div className="flex items-center gap-2 text-[#808090] text-sm mb-1"><User className="w-4 h-4" />Phone</div>
                            <div className="text-[#F0F0F0] text-sm font-medium">{dealerDetails.phoneNumber}</div>
                          </div>
                        )}

                        {/* Trade Stats */}
                        <div className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                          <div className="flex items-center gap-2 text-[#808090] text-sm mb-3"><TrendingUp className="w-4 h-4" />Trade Statistics</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center p-2 bg-[#1E1E2B] rounded-lg">
                              <div className="text-2xl font-bold text-[#F0F0F0]">{dealerDetails.tradeStats?.totalTrades || 0}</div>
                              <div className="text-xs text-[#808090]">Total Trades</div>
                            </div>
                            <div className="text-center p-2 bg-[#1E1E2B] rounded-lg">
                              <div className="text-2xl font-bold text-emerald-300">{dealerDetails.tradeStats?.settledTrades || 0}</div>
                              <div className="text-xs text-[#808090]">Settled</div>
                            </div>
                            <div className="text-center p-2 bg-[#1E1E2B] rounded-lg">
                              <div className="text-2xl font-bold text-amber-300">{dealerDetails.tradeStats?.pendingTrades || 0}</div>
                              <div className="text-xs text-[#808090]">Pending</div>
                            </div>
                            <div className="text-center p-2 bg-[#1E1E2B] rounded-lg">
                              <div className="text-lg font-bold text-[#C8F55A]">{formatCurrency(dealerDetails.tradeStats?.totalVolume || 0)}</div>
                              <div className="text-xs text-[#808090]">Volume</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                          <div className="text-[#808090] text-sm mb-1">Last Login</div>
                          <div className="text-[#F0F0F0] text-sm font-medium">{formatDate(dealerDetails.lastLoginAt)}</div>
                        </div>

                        <div className="pt-4 border-t border-[#2D2D3D]">
                          <div className="text-sm font-medium text-[#808090] mb-3">Quick Actions</div>
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => { setShowDetailsModal(false); handleResetPasswordClick(dealerDetails as any); }} className="px-4 py-2 rounded-lg font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-2">
                              <Key className="w-4 h-4" /> Reset Password
                            </button>
                            {dealerDetails.isActive ? (
                              <button onClick={() => { setShowDetailsModal(false); handleSuspendClick(dealerDetails as any); }} className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center gap-2">
                                <UserX className="w-4 h-4" /> Suspend
                              </button>
                            ) : (
                              <button onClick={() => { setShowDetailsModal(false); handleReactivateClick(dealerDetails as any); }} className="px-4 py-2 rounded-lg font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" /> Reactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trades Tab */}
                    {detailsTab === "trades" && (
                      <div className="space-y-3">
                        {dealerDetails.trades && dealerDetails.trades.length > 0 ? (
                          dealerDetails.trades.map((trade) => (
                            <div key={trade.id} className="p-4 bg-[#2D2D3D]/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-emerald-300 text-sm font-bold">{trade.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(trade.status)}`}>
                                  {trade.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <div className="text-[#808090] text-xs">Client</div>
                                  <div className="text-[#F0F0F0] font-medium truncate">{trade.clientName}</div>
                                  <div className="text-[#808090] text-xs truncate">{trade.clientEmail}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Asset</div>
                                  <div className="text-[#F0F0F0] font-medium">{trade.cryptoAmount} {trade.cryptoAsset}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Amount</div>
                                  <div className="text-emerald-300 font-medium">{formatCurrency(trade.nairaAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-[#808090] text-xs">Date</div>
                                  <div className="text-[#F0F0F0] font-medium">{formatDate(trade.createdAt)}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <History className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
                            <p className="text-[#808090]">No trades processed yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Activity Tab */}
                    {detailsTab === "activity" && (
                      <div className="space-y-3">
                        {dealerDetails.auditLogs && dealerDetails.auditLogs.length > 0 ? (
                          dealerDetails.auditLogs.map((log) => (
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


      {/* Create Dealer Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !createDealerMutation.isPending && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#F0F0F0]">Create Dealer Account</h3>
                <button onClick={() => setShowCreateModal(false)} disabled={createDealerMutation.isPending} className="text-[#B0B0B8] hover:text-[#F0F0F0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={newDealer.fullName}
                    onChange={(e) => setNewDealer({ ...newDealer, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg transition-all focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={newDealer.email}
                    onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                    placeholder="dealer@example.com"
                    className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg transition-all focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newDealer.phoneNumber}
                    onChange={(e) => setNewDealer({ ...newDealer, phoneNumber: e.target.value })}
                    placeholder="+234 801 234 5678"
                    className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg transition-all focus:outline-none"
                  />
                </div>
                <div className="bg-[#2D2D3D]/50 rounded-lg p-3">
                  <p className="text-xs text-[#B0B0B8]">
                    <span className="text-[#C8F55A]">Note:</span> A temporary password will be generated and sent to the dealer's email. They will be required to change it on first login.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} disabled={createDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleCreateDealer} disabled={createDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-[#C8F55A] text-[#1E1E2B] hover:bg-[#B8E54A] disabled:opacity-50 flex items-center justify-center gap-2">
                  {createDealerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {createDealerMutation.isPending ? "Creating..." : "Create Dealer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Modal */}
      <AnimatePresence>
        {showSuspendModal && selectedDealer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !suspendDealerMutation.isPending && setShowSuspendModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#1E1E2B] border-2 border-red-500 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <UserX className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Suspend Dealer</h3>
                <p className="text-[#808090]">This will revoke access for {selectedDealer.fullName}</p>
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
                <button onClick={() => setShowSuspendModal(false)} disabled={suspendDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmSuspend} disabled={suspendDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {suspendDealerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} Suspend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactivate Modal */}
      <AnimatePresence>
        {showReactivateModal && selectedDealer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !reactivateDealerMutation.isPending && setShowReactivateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#1E1E2B] border-2 border-emerald-500 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                  <UserCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Reactivate Dealer</h3>
                <p className="text-[#808090]">Restore access for {selectedDealer.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Type <span className="text-emerald-400 font-mono">REACTIVATE</span> to confirm</label>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="REACTIVATE" className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-emerald-400 text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg focus:outline-none font-mono" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowReactivateModal(false)} disabled={reactivateDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmReactivate} disabled={reactivateDealerMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {reactivateDealerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Reactivate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && selectedDealer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !resetPasswordMutation.isPending && setShowResetPasswordModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#1E1E2B] border-2 border-amber-500 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
                  <Key className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Reset Password</h3>
                <p className="text-[#808090]">Generate new credentials for {selectedDealer.fullName}</p>
              </div>
              <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-[#B0B0B8]">A new temporary password will be generated and sent to <span className="text-[#F0F0F0]">{selectedDealer.email}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Type <span className="text-amber-400 font-mono">RESET</span> to confirm</label>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESET" className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-amber-400 text-[#F0F0F0] placeholder-[#808090] px-4 py-3 rounded-lg focus:outline-none font-mono" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowResetPasswordModal(false)} disabled={resetPasswordMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmResetPassword} disabled={resetPasswordMutation.isPending} className="flex-1 py-3 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {resetPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Reset Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
