"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { useMemos } from "@/lib/hooks/useMemos"
import { useMemoSocket, useMemosSocket } from "@/lib/hooks/useSocket"
import {
  MemoCategory,
  MemoPriority,
  MemoStatus,
  MEMO_STATUS_CONFIG,
  MEMO_PRIORITY_CONFIG,
  MEMO_CATEGORY_CONFIG,
  formatMemoDate,
} from "@/lib/memos"
import type { Memo, CreateMemoInput } from "@/lib/api/memos"
import { Send, X, MessageSquare, Clock, Loader2, Wifi, WifiOff } from "lucide-react"

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

type FilterStatus = "all" | MemoStatus

export default function DealerReportsPage() {
  const [showNewMemoModal, setShowNewMemoModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [replyText, setReplyText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    memos,
    stats,
    pagination,
    loading,
    error,
    selectedMemo,
    fetchMemos,
    createMemo,
    addReply,
    setSelectedMemo,
    clearError,
  } = useMemos({
    autoFetch: true,
    pollInterval: 30000,
  })

  // Socket for memo list updates
  const { isConnected: listConnected } = useMemosSocket({
    onNewMemo: (event) => {
      // Refresh memo list when new memo arrives
      fetchMemos({ status: filterStatus === "all" ? undefined : filterStatus })
    },
    onMemoUpdate: (memo) => {
      // Update memo in list
      fetchMemos({ status: filterStatus === "all" ? undefined : filterStatus })
    },
  })

  // Socket for selected memo real-time updates
  const { isConnected: chatConnected, typingUsers, sendTyping } = useMemoSocket({
    memoId: selectedMemo?._id || null,
    onNewReply: (event) => {
      // Update selected memo with new reply
      if (selectedMemo && event.memoId === selectedMemo._id) {
        setSelectedMemo(event.memo)
      }
    },
    onStatusUpdate: (event) => {
      if (selectedMemo && event.memoId === selectedMemo._id) {
        setSelectedMemo(event.memo)
      }
    },
    onAssigned: (event) => {
      if (selectedMemo && event.memoId === selectedMemo._id) {
        setSelectedMemo(event.memo)
      }
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedMemo) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedMemo?.replies.length])

  // New memo form state
  const [newMemo, setNewMemo] = useState<CreateMemoInput>({
    subject: "",
    message: "",
    category: "general",
    priority: "medium",
  })
  const [creating, setCreating] = useState(false)

  // Filter memos by status
  const filteredMemos = filterStatus === "all" 
    ? memos 
    : memos.filter(m => m.status === filterStatus)

  const handleCreateMemo = async () => {
    if (!newMemo.subject.trim() || !newMemo.message.trim()) return

    setCreating(true)
    try {
      await createMemo(newMemo)
      setNewMemo({ subject: "", message: "", category: "general", priority: "medium" })
      setShowNewMemoModal(false)
    } catch (err) {
      console.error('Failed to create memo:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleSendReply = async () => {
    if (!selectedMemo || !replyText.trim()) return

    try {
      await addReply(selectedMemo._id, replyText)
      setReplyText("")
      sendTyping(false)
    } catch (err) {
      console.error('Failed to send reply:', err)
    }
  }

  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value)
    
    // Send typing indicator
    sendTyping(true)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false)
    }, 2000)
  }

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status)
    fetchMemos({ status: status === "all" ? undefined : status })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="Reports & Memos"
        subtitle="Communicate with admin team and track issues"
        action={{
          label: "New Memo",
          onClick: () => setShowNewMemoModal(true),
        }}
      />

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between"
        >
          <span className="text-red-400">{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

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
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40">
          <p className="text-sm text-green-400 mb-1">Resolved</p>
          <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-6">
        {(["all", "open", "in_progress", "resolved", "closed"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-primary/20 text-secondary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {status === "all" ? "All" : MEMO_STATUS_CONFIG[status as MemoStatus].label}
          </button>
        ))}
        {/* Connection indicator */}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {listConnected ? (
            <>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              <Wifi className="w-3 h-3 text-green-500" />
              <span>Live</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-amber-500"
              />
              <span>Polling</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && memos.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Memos List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {filteredMemos.map((memo) => {
          const statusConfig = MEMO_STATUS_CONFIG[memo.status]
          const priorityConfig = MEMO_PRIORITY_CONFIG[memo.priority]
          const categoryConfig = MEMO_CATEGORY_CONFIG[memo.category]

          return (
            <motion.div
              key={memo._id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedMemo(memo)}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer"
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
                  <span className="text-primary">Assigned to: {memo.assignedTo.fullName}</span>
                )}
              </div>
            </motion.div>
          )
        })}

        {!loading && filteredMemos.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No memos found</h3>
            <p className="text-muted-foreground">Create a new memo to communicate with the admin team.</p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
        </div>
      )}

      {/* Memo Detail Modal with Real-time Chat */}
      <AnimatePresence>
        {selectedMemo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemo(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-2 top-2 bottom-20 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] md:bottom-auto z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{MEMO_CATEGORY_CONFIG[selectedMemo.category].icon}</span>
                    <h2 className="text-lg font-semibold text-foreground">{selectedMemo.subject}</h2>
                    {/* Real-time indicator */}
                    {chatConnected ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${MEMO_STATUS_CONFIG[selectedMemo.status].bg} ${MEMO_STATUS_CONFIG[selectedMemo.status].color}`}>
                      {MEMO_STATUS_CONFIG[selectedMemo.status].label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${MEMO_PRIORITY_CONFIG[selectedMemo.priority].bg} ${MEMO_PRIORITY_CONFIG[selectedMemo.priority].color}`}>
                      {MEMO_PRIORITY_CONFIG[selectedMemo.priority].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedMemo(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original message */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{selectedMemo.createdBy.fullName}</span>
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
                {selectedMemo.replies.map((reply, index) => (
                  <motion.div
                    key={reply._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl ${
                      reply.createdBy.role === "admin"
                        ? "bg-secondary/10 border border-secondary/20 ml-4"
                        : "bg-muted border border-border mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {reply.createdBy.fullName}
                        <span className="text-xs text-muted-foreground ml-2">({reply.createdBy.role})</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{formatMemoDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground">{reply.message}</p>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground ml-4"
                  >
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground"
                      />
                    </div>
                    <span>Someone is typing...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {selectedMemo.status !== "closed" && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={handleReplyInputChange}
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
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-2 top-2 bottom-20 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:bottom-auto z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">New Memo</h2>
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
                    placeholder="Brief description of the issue"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    value={newMemo.message}
                    onChange={(e) => setNewMemo({ ...newMemo, message: e.target.value })}
                    placeholder="Describe the issue or request in detail..."
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
                    disabled={!newMemo.subject.trim() || !newMemo.message.trim() || creating}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
