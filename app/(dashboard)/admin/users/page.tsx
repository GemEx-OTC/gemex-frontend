"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { AlertTriangle, UserX } from "lucide-react"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "suspended">("all")
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [processing, setProcessing] = useState(false)

  const users = [
    { id: 1, email: "john.doe@email.com", name: "John Doe", status: "verified", joinedAt: "Nov 15, 2024", trades: 12 },
    {
      id: 2,
      email: "chioma.okonkwo@email.com",
      name: "Chioma Okonkwo",
      status: "pending",
      joinedAt: "Dec 2, 2024",
      trades: 0,
    },
    {
      id: 3,
      email: "tunde.malik@email.com",
      name: "Tunde Malik",
      status: "verified",
      joinedAt: "Oct 20, 2024",
      trades: 28,
    },
    {
      id: 4,
      email: "suspicious.user@email.com",
      name: "Unknown User",
      status: "suspended",
      joinedAt: "Dec 1, 2024",
      trades: 1,
    },
    {
      id: 5,
      email: "amara.kingsley@email.com",
      name: "Amara Kingsley",
      status: "verified",
      joinedAt: "Nov 5, 2024",
      trades: 15,
    },
  ]

  const filteredUsers = users.filter(
    (u) =>
      (filter === "all" || u.status === filter) &&
      (u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSuspendClick = (user: any) => {
    setSelectedUser(user)
    setShowSuspendModal(true)
    setSuspendReason("")
    setConfirmText("")
  }

  const handleConfirmSuspend = () => {
    if (confirmText !== "SUSPEND") {
      alert('Please type "SUSPEND" to confirm')
      return
    }

    if (!suspendReason.trim()) {
      alert("Please provide a reason for suspension")
      return
    }

    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setShowSuspendModal(false)
      alert(`User ${selectedUser.name} has been suspended`)
    }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="User Management" subtitle="Monitor and manage user accounts and compliance status" />

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
          <div className="flex gap-2">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8]">Joined</th>
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "verified"
                          ? "bg-[#C8F55A]/20 text-[#C8F55A]"
                          : user.status === "pending"
                            ? "bg-[#641AE4]/20 text-[#641AE4]"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#B0B0B8] text-sm">{user.joinedAt}</td>
                  <td className="px-6 py-4 text-[#F0F0F0] font-semibold">{user.trades}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.status === "pending" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs px-3 py-1 rounded bg-[#641AE4]/20 text-[#641AE4] hover:bg-[#641AE4]/30 transition-all"
                        >
                          Verify
                        </motion.button>
                      )}
                      {user.status !== "suspended" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuspendClick(user)}
                          className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium"
                        >
                          Suspend
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

      {/* Multi-Step Suspend Confirmation Modal */}
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
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Suspend User Account</h3>
                <p className="text-[#B0B0B8]">This is a critical action that requires confirmation</p>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-400 font-medium mb-1">Warning</p>
                    <p className="text-xs text-[#B0B0B8]">
                      Suspending this user will immediately revoke their access to the platform and freeze all pending
                      trades.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
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

              {/* Reason Input */}
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

              {/* Confirmation Text */}
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

              {/* Actions */}
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
                  {processing ? "Suspending..." : "Suspend User"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
