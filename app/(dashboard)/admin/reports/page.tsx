"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  Memo,
  MemoCategory,
  MemoPriority,
  MemoStatus,
  MEMO_STATUS_CONFIG,
  MEMO_PRIORITY_CONFIG,
  MEMO_CATEGORY_CONFIG,
  formatMemoDate,
} from "@/lib/memos"
import { Send, Plus, X, MessageSquare, Clock, Filter, UserCheck, CheckCircle } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// Mock dealers for assignment
const mockDealers = [
  { id: "dealer1", name: "James O." },
  { id: "dealer2", name: "Mike T." },
  { id: "dealer3", name: "Linda K." },
]

// Mock memos data (from dealer perspective, admin sees all)
const mockMemos: Memo[] = [
  {
    id: "MEMO001",
    subject: "Rate adjustment request for high-volume client",
    message: "Client Premium Corp has requested a better rate for their 50,000 USDT trade. They're a repeat customer with 15+ successful trades. Requesting approval for ₦1,570/USD.",
    category: "rate_request",
    priority: "high",
    status: "open",
    createdBy: { id: "dealer1", name: "James O.", role: "dealer" },
    referenceType: "quote",
    referenceId: "QT-2024-0150",
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "MEMO002",
    subject: "Payout delay - Bank maintenance",
    message: "GTBank is experiencing maintenance issues. Multiple payouts are pending. Need guidance on how to communicate with affected clients.",
    category: "system_issue",
    priority: "urgent",
    status: "in_progress",
    createdBy: { id: "dealer1", name: "James O.", role: "dealer" },
    assignedTo: { id: "admin1", name: "Sarah A.", role: "admin" },
    replies: [
      {
        id: "R001",
        message: "Thanks for flagging. I've contacted GTBank support. ETA for resolution is 2 hours. Please inform clients of the delay.",
        createdBy: { id: "admin1", name: "Sarah A.", role: "admin" },
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "MEMO003",
    subject: "Suspicious activity - Client verification needed",
    message: "Client with email suspicious@example.com has made 3 failed deposit attempts with different wallet addresses. Requesting KYC review before processing further trades.",
    category: "client_concern",
    priority: "high",
    status: "resolved",
    createdBy: { id: "dealer2", name: "Mike T.", role: "dealer" },
    assignedTo: { id: "admin1", name: "Sarah A.", role: "admin" },
    referenceType: "user",
    referenceId: "USR-2024-0892",
    replies: [
      {
        id: "R002",
        message: "Good catch. I've flagged the account and requested additional verification. Account is now on hold pending review.",
        createdBy: { id: "admin1", name: "Sarah A.", role: "admin" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "R003",
        message: "KYC review complete. Account has been suspended due to identity mismatch. Thanks for the escalation.",
        createdBy: { id: "admin1", name: "Sarah A.", role: "admin" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "MEMO004",
    subject: "New rate structure proposal",
    message: "Based on market analysis, I suggest implementing tiered rates: Standard (₦1,565), Premium (₦1,570 for >$10k), VIP (₦1,575 for >$50k). This could improve client retention.",
    category: "general",
    priority: "medium",
    status: "open",
    createdBy: { id: "dealer3", name: "Linda K.", role: "dealer" },
    replies: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

type FilterStatus = "all" | MemoStatus

export default function AdminReportsPage() {
  const [memos, setMemos] = useState<Memo[]>(mockMemos)
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null)
  const [showNewMemoModal, setShowNewMemoModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [replyText, setReplyText] = useState("")

  // New memo form state
  const [newMemo, setNewMemo] = useState({
    subject: "",
    message: "",
    category: "general" as MemoCategory,
    priority: "medium" as MemoPriority,
    assignTo: "",
  })

  const filteredMemos = memos.filter((m) => filterStatus === "all" || m.status === filterStatus)

  const stats = {
    total: memos.length,
    open: memos.filter((m) => m.status === "open").length,
    inProgress: memos.filter((m) => m.status === "in_progress").length,
    urgent: memos.filter((m) => m.priority === "urgent" && m.status !== "resolved" && m.status !== "closed").length,
  }

  const handleCreateMemo = () => {
    if (!newMemo.subject.trim() || !newMemo.message.trim()) return

    const memo: Memo = {
      id: `MEMO${String(memos.length + 1).padStart(3, "0")}`,
      subject: newMemo.subject,
      message: newMemo.message,
      category: newMemo.category,
      priority: newMemo.priority,
      status: "open",
      createdBy: { id: "admin1", name: "Sarah A.", role: "admin" },
      assignedTo: newMemo.assignTo
        ? { id: newMemo.assignTo, name: mockDealers.find((d) => d.id === newMemo.assignTo)?.name || "", role: "dealer" }
        : undefined,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setMemos([memo, ...memos])
    setNewMemo({ subject: "", message: "", category: "general", priority: "medium", assignTo: "" })
    setShowNewMemoModal(false)
  }

  const handleSendReply = () => {
    if (!selectedMemo || !replyText.trim()) return

    const reply = {
      id: `R${Date.now()}`,
      message: replyText,
      createdBy: { id: "admin1", name: "Sarah A.", role: "admin" as const },
      createdAt: new Date().toISOString(),
    }

    setMemos(
      memos.map((m) =>
        m.id === selectedMemo.id
          ? { ...m, replies: [...m.replies, reply], updatedAt: new Date().toISOString() }
          : m
      )
    )
    setSelectedMemo({ ...selectedMemo, replies: [...selectedMemo.replies, reply] })
    setReplyText("")
  }

  const handleUpdateStatus = (memoId: string, newStatus: MemoStatus) => {
    setMemos(
      memos.map((m) =>
        m.id === memoId ? { ...m, status: newStatus, updatedAt: new Date().toISOString() } : m
      )
    )
    if (selectedMemo?.id === memoId) {
      setSelectedMemo({ ...selectedMemo, status: newStatus })
    }
  }

  const handleAssignMemo = (memoId: string, dealerId: string) => {
    const dealer = mockDealers.find((d) => d.id === dealerId)
    if (!dealer) return

    setMemos(
      memos.map((m) =>
        m.id === memoId
          ? {
              ...m,
              assignedTo: { id: dealer.id, name: dealer.name, role: "dealer" },
              status: m.status === "open" ? "in_progress" : m.status,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    )
    if (selectedMemo?.id === memoId) {
      setSelectedMemo({
        ...selectedMemo,
        assignedTo: { id: dealer.id, name: dealer.name, role: "dealer" },
        status: selectedMemo.status === "open" ? "in_progress" : selectedMemo.status,
      })
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="Reports & Memos"
        subtitle="Manage dealer communications and escalations"
        action={{
          label: "New Memo",
          onClick: () => setShowNewMemoModal(true),
        }}
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <p className="text-sm text-blue-400 mb-1">Total Memos</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40">
          <p className="text-sm text-amber-400 mb-1">Open</p>
          <p className="text-2xl font-bold text-foreground">{stats.open}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-2 border-purple-500/40">
          <p className="text-sm text-purple-400 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border-2 border-red-500/40">
          <p className="text-sm text-red-400 mb-1">Urgent</p>
          <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {(["all", "open", "in_progress", "resolved", "closed"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-primary/20 text-secondary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {status === "all" ? "All" : MEMO_STATUS_CONFIG[status as MemoStatus].label}
          </button>
        ))}
      </motion.div>

      {/* Memos List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredMemos.map((memo) => {
          const statusConfig = MEMO_STATUS_CONFIG[memo.status]
          const priorityConfig = MEMO_PRIORITY_CONFIG[memo.priority]
          const categoryConfig = MEMO_CATEGORY_CONFIG[memo.category]

          return (
            <motion.div
              key={memo.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedMemo(memo)}
              className={`p-4 rounded-xl bg-card border transition-all cursor-pointer ${
                memo.priority === "urgent" && memo.status === "open"
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{categoryConfig.icon}</span>
                    <h3 className="font-semibold text-foreground truncate">{memo.subject}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{memo.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.bg} ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>From: {memo.createdBy.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatMemoDate(memo.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {memo.replies.length} replies
                  </span>
                </div>
                {memo.assignedTo && (
                  <span className="text-secondary flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {memo.assignedTo.name}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}

        {filteredMemos.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No memos found</h3>
            <p className="text-muted-foreground">All caught up! No memos match your filter.</p>
          </div>
        )}
      </motion.div>

      {/* Memo Detail Modal */}
      <AnimatePresence>
        {selectedMemo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemo(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{MEMO_CATEGORY_CONFIG[selectedMemo.category].icon}</span>
                      <h2 className="text-lg font-semibold text-foreground">{selectedMemo.subject}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">From: {selectedMemo.createdBy.name}</p>
                  </div>
                  <button onClick={() => setSelectedMemo(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Admin Controls */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <select
                      value={selectedMemo.status}
                      onChange={(e) => handleUpdateStatus(selectedMemo.id, e.target.value as MemoStatus)}
                      className="px-3 py-1 rounded-lg bg-muted border border-border text-sm focus:border-primary focus:outline-none"
                    >
                      {Object.entries(MEMO_STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Assign to:</span>
                    <select
                      value={selectedMemo.assignedTo?.id || ""}
                      onChange={(e) => handleAssignMemo(selectedMemo.id, e.target.value)}
                      className="px-3 py-1 rounded-lg bg-muted border border-border text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {mockDealers.map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${MEMO_PRIORITY_CONFIG[selectedMemo.priority].bg} ${MEMO_PRIORITY_CONFIG[selectedMemo.priority].color}`}>
                    {MEMO_PRIORITY_CONFIG[selectedMemo.priority].label}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original message */}
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {selectedMemo.createdBy.name}
                      <span className="text-xs text-muted-foreground ml-2">({selectedMemo.createdBy.role})</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{formatMemoDate(selectedMemo.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground">{selectedMemo.message}</p>
                  {selectedMemo.referenceId && (
                    <p className="text-xs text-primary mt-2">
                      Reference: {selectedMemo.referenceType} #{selectedMemo.referenceId}
                    </p>
                  )}
                </div>

                {/* Replies */}
                {selectedMemo.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-xl ${
                      reply.createdBy.role === "admin"
                        ? "bg-secondary/10 border border-secondary/20 ml-4"
                        : "bg-muted border border-border mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {reply.createdBy.name}
                        <span className="text-xs text-muted-foreground ml-2">({reply.createdBy.role})</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{formatMemoDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              {selectedMemo.status !== "closed" && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Memo Modal */}
      <AnimatePresence>
        {showNewMemoModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewMemoModal(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">New Memo to Dealers</h2>
                <button onClick={() => setShowNewMemoModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={newMemo.subject}
                    onChange={(e) => setNewMemo({ ...newMemo, subject: e.target.value })}
                    placeholder="Brief description"
                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={newMemo.category}
                      onChange={(e) => setNewMemo({ ...newMemo, category: e.target.value as MemoCategory })}
                      className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {Object.entries(MEMO_CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                    <select
                      value={newMemo.priority}
                      onChange={(e) => setNewMemo({ ...newMemo, priority: e.target.value as MemoPriority })}
                      className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                    >
                      {Object.entries(MEMO_PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Assign to Dealer (Optional)</label>
                  <select
                    value={newMemo.assignTo}
                    onChange={(e) => setNewMemo({ ...newMemo, assignTo: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">All Dealers</option>
                    {mockDealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    value={newMemo.message}
                    onChange={(e) => setNewMemo({ ...newMemo, message: e.target.value })}
                    placeholder="Enter your message to dealers..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowNewMemoModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMemo}
                    disabled={!newMemo.subject.trim() || !newMemo.message.trim()}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    Send Memo
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
