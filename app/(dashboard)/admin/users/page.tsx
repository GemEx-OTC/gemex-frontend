"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "suspended">("all")

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
                        <button className="text-xs px-3 py-1 rounded bg-[#641AE4]/20 text-[#641AE4] hover:bg-[#641AE4]/30 transition-all">
                          Verify
                        </button>
                      )}
                      {user.status !== "suspended" && (
                        <button className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                          Suspend
                        </button>
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
    </motion.div>
  )
}
