"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { useAdminNotifications } from "@/lib/hooks/useNotifications"
import { isUnread, getNotificationId } from "@/lib/notifications"
import type { Notification, NotificationType, NotificationPriority } from "@/lib/api/notifications"
import { 
  Bell, CheckCheck, Inbox, Shield, Users, Send, 
  Loader2, RefreshCw, Plus, X 
} from "lucide-react"
import { useRouter } from "next/navigation"

type FilterType = "all" | "unread" | "kyc" | "trades" | "system"

const KYC_TYPES: NotificationType[] = ['KycStatusChange', 'AccountStatusChange']
const TRADE_TYPES: NotificationType[] = ['TradeCreated', 'DepositConfirmed', 'PayoutSuccess', 'PayoutFailed']
const SYSTEM_TYPES: NotificationType[] = ['AdminAction', 'RateUpdated', 'SystemAlert', 'SecurityAlert']

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    systemStats,
    fetchNotifications,
    fetchSystemStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notifyByRole,
    setPage,
  } = useAdminNotifications({
    autoFetch: true,
    pollInterval: 30000,
    filters: { limit: 20 },
  })

  useEffect(() => {
    fetchSystemStats()
  }, [fetchSystemStats])

  // Count KYC pending notifications
  const kycPendingCount = notifications.filter(n => 
    isUnread(n) && n.type === "KycStatusChange"
  ).length

  // Apply client-side filtering
  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter(n => isUnread(n))
      case "kyc":
        return notifications.filter(n => KYC_TYPES.includes(n.type))
      case "trades":
        return notifications.filter(n => TRADE_TYPES.includes(n.type))
      case "system":
        return notifications.filter(n => SYSTEM_TYPES.includes(n.type))
      default:
        return notifications
    }
  }

  const filteredNotifications = getFilteredNotifications()

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleNavigate = (notification: Notification) => {
    handleMarkAsRead(getNotificationId(notification))
    if (notification.referenceType === "User" || notification.referenceType === "KYC") {
      router.push("/admin/users")
    } else if (notification.referenceType === "Trade") {
      router.push("/admin/dashboard")
    }
  }

  const handleRefresh = () => {
    fetchNotifications({ page: 1 })
    fetchSystemStats()
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "kyc", label: "KYC & Users" },
    { key: "trades", label: "Trades" },
    { key: "system", label: "System" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DashboardHeader
        title="Notifications"
        subtitle="System alerts and administrative updates"
        action={unreadCount > 0 ? {
          label: "Mark all read",
          onClick: handleMarkAllAsRead,
        } : undefined}
      />

      {/* KYC Alert */}
      {kycPendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-indigo-400">{kycPendingCount} KYC Review Pending</p>
              <p className="text-sm text-muted-foreground">New user verifications awaiting your approval</p>
            </div>
            <button
              onClick={() => router.push("/admin/users")}
              className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
            >
              Review Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{systemStats?.total || pagination.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-red-400" />
            <span className="text-sm text-muted-foreground">Unread</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{systemStats?.unreadTotal || unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-muted-foreground">KYC Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{kycPendingCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{systemStats?.todayCount || 0}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-primary/20 text-secondary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
            Broadcast
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={getNotificationId(notification)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                  onDelete={handleDelete}
                  showPriority
                />
              </motion.div>
            ))
          ) : !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === "unread" ? "All caught up! No pending alerts." : "No notifications match your filter."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Broadcast Modal */}
      <BroadcastModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSend={notifyByRole}
      />
    </motion.div>
  )
}

// Broadcast Modal Component
interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (data: any) => Promise<number>
}

function BroadcastModal({ isOpen, onClose, onSend }: BroadcastModalProps) {
  const [role, setRole] = useState<'client' | 'dealer' | 'admin'>('client')
  const [type, setType] = useState<NotificationType>('SystemAlert')
  const [priority, setPriority] = useState<NotificationPriority>('normal')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return

    setLoading(true)
    setResult(null)
    try {
      const count = await onSend({
        role,
        type,
        title,
        message,
        priority,
        sendEmail,
      })
      setResult(`Successfully sent to ${count} ${role}s`)
      setTimeout(() => {
        onClose()
        setTitle('')
        setMessage('')
        setResult(null)
      }, 2000)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-4 p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Broadcast Notification</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="client">All Clients</option>
                <option value="dealer">All Dealers</option>
                <option value="admin">All Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
            >
              <option value="SystemAlert">System Alert</option>
              <option value="AdminAction">Admin Action</option>
              <option value="RateUpdated">Rate Update</option>
              <option value="SecurityAlert">Security Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground resize-none"
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">Also send via email</span>
          </label>

          {result && (
            <div className={`p-3 rounded-lg text-sm ${
              result.startsWith('Error') 
                ? 'bg-red-500/10 text-red-400' 
                : 'bg-green-500/10 text-green-400'
            }`}>
              {result}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title || !message}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
