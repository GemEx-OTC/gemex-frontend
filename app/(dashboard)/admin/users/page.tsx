"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  AlertTriangle, UserX, UserCheck, Eye, X, Shield, Mail, Calendar, 
  TrendingUp, BanknoteIcon, History, User, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { TRANSACTION_STATUS } from "@/lib/constants"

type UserStatus = "verified" | "pending" | "suspended"
type TransactionStatus = keyof typeof TRANSACTION_STATUS

interface Transaction {
  id: string
  cryptoAsset: string
  cryptoAmount: string
  nairaAmount: string
  status: TransactionStatus
  date: string
  rate: string
}

interface User {
  id: number
  email: string
  name: string
  status: UserStatus
  joinedAt: string
  trades: number
  phone?: string
  kycLevel?: string
  lastActive?: string
  payoutEnabled: boolean
  transactions: Transaction[]
}

// Mock transaction data per user
const mockTransactions: Record<number, Transaction[]> = {
  1: [
    { id: "TXN001", cryptoAsset: "BTC", cryptoAmount: "2.5", nairaAmount: "₦108,750,000", status: "Settled", date: "04/12/2024", rate: "₦43.5M" },
    { id: "TXN002", cryptoAsset: "USDT", cryptoAmount: "5,000", nairaAmount: "₦7,825,000", status: "Settled", date: "02/12/2024", rate: "₦1,565" },
  ],
  3: [
    { id: "TXN003", cryptoAsset: "BTC", cryptoAmount: "1.0", nairaAmount: "₦43,500,000", status: "Settled", date: "01/12/2024", rate: "₦43.5M" },
    { id: "TXN004", cryptoAsset: "USDT", cryptoAmount: "10,000", nairaAmount: "₦15,650,000", status: "PayoutPending", date: "28/11/2024", rate: "₦1,565" },
  ],
  4: [
    { id: "TXN005", cryptoAsset: "USDT", cryptoAmount: "500", nairaAmount: "₦782,500", status: "Failed", date: "01/12/2024", rate: "₦1,565" },
  ],
  5: [
    { id: "TXN006", cryptoAsset: "BTC", cryptoAmount: "0.5", nairaAmount: "₦21,750,000", status: "Settled", date: "30/11/2024", rate: "₦43.5M" },
    { id: "TXN007", cryptoAsset: "USDT", cryptoAmount: "2,000", nairaAmount: "₦3,130,000", status: "CryptoConfirmed", date: "05/12/2024", rate: "₦1,565" },
  ],
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | UserStatus>("all")
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [detailsTab, setDetailsTab] = useState<"overview" | "transactions">("overview")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [payoutReason, setPayoutReason] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [processing, setProcessing] = useState(false)

  const [users, setUsers] = useState<User[]>([
    { id: 1, email: "john.doe@email.com", name: "John Doe", status: "verified", joinedAt: "Nov 15, 2024", trades: 12, phone: "+234 801 234 5678", kycLevel: "Level 3", lastActive: "2 hours ago", payoutEnabled: true, transactions: mockTransactions[1] || [] },
    { id: 2, email: "chioma.okonkwo@email.com", name: "Chioma Okonkwo", status: "pending", joinedAt: "Dec 2, 2024", trades: 0, phone: "+234 802 345 6789", kycLevel: "Level 1", lastActive: "1 day ago", payoutEnabled: true, transactions: [] },
    { id: 3, email: "tunde.malik@email.com", name: "Tunde Malik", status: "verified", joinedAt: "Oct 20, 2024", trades: 28, phone: "+234 803 456 7890", kycLevel: "Level 3", lastActive: "30 minutes ago", payoutEnabled: true, transactions: mockTransactions[3] || [] },
    { id: 4, email: "suspicious.user@email.com", name: "Unknown User", status: "suspended", joinedAt: "Dec 1, 2024", trades: 1, phone: "+234 804 567 8901", kycLevel: "Level 1", lastActive: "5 days ago", payoutEnabled: false, transactions: mockTransactions[4] || [] },
    { id: 5, email: "amara.kingsley@email.com", name: "Amara Kingsley", status: "verified", joinedAt: "Nov 5, 2024", trades: 15, phone: "+234 805 678 9012", kycLevel: "Level 2", lastActive: "1 hour ago", payoutEnabled: true, transactions: mockTransactions[5] || [] },
  ])

  const filteredUsers = users.filter(
    (u) =>
      (filter === "all" || u.status === filter) &&
      (u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setDetailsTab("overview")
    setShowDetailsModal(true)
  }

  const handleSuspendClick = (user: User) => {
    setSelectedUser(user)
    setShowSuspendModal(true)
    setSuspendReason("")
    setConfirmText("")
  }

  const handleReactivateClick = (user: User) => {
    setSelectedUser(user)
    setShowReactivateModal(true)
    setConfirmText("")
  }

  const handlePayoutToggle = (user: User) => {
    setSelectedUser(user)
    setPayoutReason("")
    setShowPayoutModal(true)
  }

  const handleConfirmSuspend = () => {
    if (confirmText !== "SUSPEND") {
      toast.error("Please type SUSPEND to confirm")
      return
    }
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension")
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser?.id ? { ...u, status: "suspended" as UserStatus, payoutEnabled: false } : u
      ))
      setProcessing(false)
      setShowSuspendModal(false)
      toast.success(`Access revoked for ${selectedUser?.name}`, {
        description: "User has been suspended and payouts disabled"
      })
    }, 1500)
  }

  const handleConfirmReactivate = () => {
    if (confirmText !== "REACTIVATE") {
      toast.error("Please type REACTIVATE to confirm")
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser?.id ? { ...u, status: "verified" as UserStatus } : u
      ))
      setProcessing(false)
      setShowReactivateModal(false)
      toast.success(`Access restored for ${selectedUser?.name}`, {
        description: "User account has been reactivated"
      })
    }, 1500)
  }

  const handleConfirmPayoutToggle = () => {
    if (!selectedUser) return
    const isEnabling = !selectedUser.payoutEnabled
    if (!isEnabling && !payoutReason.trim()) {
      toast.error("Please provide a reason for disabling payouts")
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser?.id ? { ...u, payoutEnabled: isEnabling } : u
      ))
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, payoutEnabled: isEnabling })
      }
      setProcessing(false)
      setShowPayoutModal(false)
      toast.success(isEnabling ? `Payouts enabled for ${selectedUser?.name}` : `Payouts disabled for ${selectedUser?.name}`, {
        description: isEnabling ? "User can now receive payouts" : "User payouts have been frozen"
      })
    }, 1000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="User Management" subtitle="Monitor and manage user accounts, transactions, and compliance" />

      {/* Search and Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            {(["all", "verified", "pending", "suspended"] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setFilter(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === tab ? "bg-[#641AE4] text-white" : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto">
        <div className="min-w-full bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D2D3D] bg-[#2D2D3D]/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Payout</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Trades</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-[#F0F0F0] font-medium">{user.name}</div>
                      <div className="text-[#B0B0B8] text-sm">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "verified" ? "bg-[#C8F55A]/20 text-[#C8F55A]"
                        : user.status === "pending" ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.payoutEnabled ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.payoutEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#F0F0F0] font-semibold">{user.trades}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(user)}
                        className="text-xs px-3 py-1.5 rounded bg-[#641AE4]/20 text-[#A78BFA] hover:bg-[#641AE4]/30 transition-all font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePayoutToggle(user)}
                        className={`text-xs px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1 ${
                          user.payoutEnabled 
                            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                            : "bg-[#C8F55A]/20 text-[#C8F55A] hover:bg-[#C8F55A]/30"
                        }`}
                      >
                        <BanknoteIcon className="w-3 h-3" />
                        {user.payoutEnabled ? "Disable" : "Enable"}
                      </motion.button>
                      {user.status === "suspended" ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReactivateClick(user)}
                          className="text-xs px-3 py-1.5 rounded bg-[#C8F55A]/20 text-[#C8F55A] hover:bg-[#C8F55A]/30 transition-all font-medium flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Reactivate
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuspendClick(user)}
                          className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          Revoke
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {filteredUsers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <p className="text-[#B0B0B8]">No users found matching your criteria</p>
        </motion.div>
      )}

      {/* User Details Modal with Tabs */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
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
              className="bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#F0F0F0]">User Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-[#B0B0B8] hover:text-[#F0F0F0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-[#2D2D3D] pb-4">
                <button
                  onClick={() => setDetailsTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    detailsTab === "overview" ? "bg-[#641AE4] text-white" : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setDetailsTab("transactions")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    detailsTab === "transactions" ? "bg-[#641AE4] text-white" : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                  }`}
                >
                  <History className="w-4 h-4" />
                  Transactions ({selectedUser.transactions.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {detailsTab === "overview" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#2D2D3D]/50 rounded-lg">
                      <div className="w-14 h-14 rounded-full bg-[#641AE4]/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#641AE4]">{selectedUser.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[#F0F0F0] font-semibold text-lg">{selectedUser.name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.status === "verified" ? "bg-[#C8F55A]/20 text-[#C8F55A]"
                              : selectedUser.status === "pending" ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedUser.payoutEnabled ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-red-500/20 text-red-400"
                          }`}>
                            Payout: {selectedUser.payoutEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#B0B0B8] text-sm mb-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                        <div className="text-[#F0F0F0] text-sm font-medium truncate">{selectedUser.email}</div>
                      </div>
                      <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#B0B0B8] text-sm mb-1">
                          <Shield className="w-4 h-4" />
                          KYC Level
                        </div>
                        <div className="text-[#F0F0F0] text-sm font-medium">{selectedUser.kycLevel || "N/A"}</div>
                      </div>
                      <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#B0B0B8] text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          Joined
                        </div>
                        <div className="text-[#F0F0F0] text-sm font-medium">{selectedUser.joinedAt}</div>
                      </div>
                      <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#B0B0B8] text-sm mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Total Trades
                        </div>
                        <div className="text-[#F0F0F0] text-sm font-medium">{selectedUser.trades}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#2D2D3D]/30 rounded-lg">
                      <div className="text-[#B0B0B8] text-sm mb-1">Last Active</div>
                      <div className="text-[#F0F0F0] text-sm font-medium">{selectedUser.lastActive || "Unknown"}</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-[#2D2D3D]">
                      <div className="text-sm font-medium text-[#B0B0B8] mb-3">Quick Actions</div>
                      <div className="flex gap-2 flex-wrap">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { setShowDetailsModal(false); handlePayoutToggle(selectedUser); }}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                            selectedUser.payoutEnabled 
                              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                              : "bg-[#C8F55A]/20 text-[#C8F55A] hover:bg-[#C8F55A]/30"
                          }`}
                        >
                          <BanknoteIcon className="w-4 h-4" />
                          {selectedUser.payoutEnabled ? "Disable Payout" : "Enable Payout"}
                        </motion.button>
                        {selectedUser.status === "suspended" ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowDetailsModal(false); handleReactivateClick(selectedUser); }}
                            className="px-4 py-2 rounded-lg font-medium bg-[#C8F55A]/20 text-[#C8F55A] hover:bg-[#C8F55A]/30 flex items-center gap-2 transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                            Reactivate User
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowDetailsModal(false); handleSuspendClick(selectedUser); }}
                            className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-2 transition-all"
                          >
                            <UserX className="w-4 h-4" />
                            Revoke Access
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Transactions Tab */
                  <div className="space-y-3">
                    {selectedUser.transactions.length > 0 ? (
                      selectedUser.transactions.map((txn) => {
                        const statusInfo = TRANSACTION_STATUS[txn.status]
                        return (
                          <div key={txn.id} className="p-4 bg-[#2D2D3D]/30 rounded-lg hover:bg-[#2D2D3D]/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-[#C8F55A] text-sm font-bold">{txn.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <div className="text-[#B0B0B8] text-xs">Asset</div>
                                <div className="text-[#F0F0F0] font-medium">{txn.cryptoAmount} {txn.cryptoAsset}</div>
                              </div>
                              <div>
                                <div className="text-[#B0B0B8] text-xs">Amount</div>
                                <div className="text-[#C8F55A] font-medium">{txn.nairaAmount}</div>
                              </div>
                              <div>
                                <div className="text-[#B0B0B8] text-xs">Rate</div>
                                <div className="text-[#F0F0F0] font-medium">{txn.rate}</div>
                              </div>
                              <div>
                                <div className="text-[#B0B0B8] text-xs">Date</div>
                                <div className="text-[#F0F0F0] font-medium">{txn.date}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12">
                        <History className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
                        <p className="text-[#B0B0B8]">No transactions found for this user</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-[#2D2D3D]">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Toggle Modal */}
      <AnimatePresence>
        {showPayoutModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#1E1E2B] border-2 ${selectedUser.payoutEnabled ? "border-amber-500" : "border-[#C8F55A]"} rounded-2xl p-8 max-w-md w-full`}
            >
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${selectedUser.payoutEnabled ? "bg-amber-500/20" : "bg-[#C8F55A]/20"} mb-4`}>
                  <BanknoteIcon className={`w-8 h-8 ${selectedUser.payoutEnabled ? "text-amber-400" : "text-[#C8F55A]"}`} />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">
                  {selectedUser.payoutEnabled ? "Disable Payouts" : "Enable Payouts"}
                </h3>
                <p className="text-[#B0B0B8]">
                  {selectedUser.payoutEnabled 
                    ? "This will freeze all pending and future payouts for this user" 
                    : "This will allow the user to receive payouts again"}
                </p>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">User:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Email:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Current Status:</span>
                    <span className={`font-medium ${selectedUser.payoutEnabled ? "text-[#C8F55A]" : "text-red-400"}`}>
                      {selectedUser.payoutEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.payoutEnabled && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                    Reason for disabling <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    value={payoutReason}
                    onChange={(e) => setPayoutReason(e.target.value)}
                    placeholder="Provide a reason for disabling payouts..."
                    rows={3}
                    className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-amber-400 text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayoutModal(false)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPayoutToggle}
                  disabled={processing || (selectedUser.payoutEnabled && !payoutReason.trim())}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedUser.payoutEnabled 
                      ? "text-white bg-amber-500 hover:bg-amber-600" 
                      : "text-[#0D0D12] bg-[#C8F55A] hover:bg-[#b8e550]"
                  }`}
                >
                  {processing ? "Processing..." : selectedUser.payoutEnabled ? "Disable Payouts" : "Enable Payouts"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Confirmation Modal */}
      <AnimatePresence>
        {showSuspendModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowSuspendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border-2 border-red-500 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <UserX className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Revoke All Access</h3>
                <p className="text-[#B0B0B8]">This action requires confirmation</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-400 font-medium mb-1">Warning</p>
                    <p className="text-xs text-[#B0B0B8]">
                      This will immediately revoke all user access, disable payouts, and freeze all pending trades.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">User:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Email:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Total Trades:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.trades}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Reason for Suspension <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Provide a detailed reason for this suspension..."
                  rows={3}
                  className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-red-400 text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Type <span className="text-red-400 font-mono">SUSPEND</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SUSPEND"
                  className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-red-400 text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSuspendModal(false)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmSuspend}
                  disabled={processing || confirmText !== "SUSPEND" || !suspendReason.trim()}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Suspending..." : "Revoke All Access"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactivate Confirmation Modal */}
      <AnimatePresence>
        {showReactivateModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowReactivateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border-2 border-[#C8F55A] rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8F55A]/20 mb-4">
                  <UserCheck className="w-8 h-8 text-[#C8F55A]" />
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Restore User Access</h3>
                <p className="text-[#B0B0B8]">Reactivate this suspended account</p>
              </div>

              <div className="bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <UserCheck className="w-5 h-5 text-[#C8F55A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#C8F55A] font-medium mb-1">Note</p>
                    <p className="text-xs text-[#B0B0B8]">
                      Reactivating this user will restore their platform access. Payouts will remain disabled until manually enabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">User:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Email:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">Total Trades:</span>
                    <span className="text-[#F0F0F0] font-medium">{selectedUser.trades}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                  Type <span className="text-[#C8F55A] font-mono">REACTIVATE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="REACTIVATE"
                  className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReactivateModal(false)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmReactivate}
                  disabled={processing || confirmText !== "REACTIVATE"}
                  className="flex-1 py-3 rounded-lg font-semibold text-[#0D0D12] bg-[#C8F55A] hover:bg-[#b8e550] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Reactivating..." : "Restore Access"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
