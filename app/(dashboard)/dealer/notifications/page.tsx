"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { isUnread, getNotificationId } from "@/lib/notifications"
import type { Notification, NotificationType } from "@/lib/api/notifications"
import { Bell, CheckCheck, Inbox, TrendingUp, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

type FilterType = "all" | "unread" | "quotes" | "trades" | "rates"

const QUOTE_TYPES: NotificationType[] = ['QuoteGenerated', 'QuoteAccepted', 'QuoteRejected', 'QuoteExpired']
const TRADE_TYPES: NotificationType[] = ['TradeCreated', 'DepositConfirmed', 'PayoutSuccess', 'PayoutFailed']
const RATE_TYPES: NotificationType[] = ['RateUpdated']

export default function DealerNotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>("all")
  
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setPage,
  } = useNotifications({
    autoFetch: true,
    pollInterval: 15000, // Poll every 15 seconds for dealers (more urgent)
    filters: { limit: 20 },
  })

  // Count urgent notifications (quotes and deposits awaiting action)
  const urgentCount = notifications.filter(n => 
    isUnread(n) && ['QuoteGenerated', 'DepositConfirmed'].includes(n.type)
  ).length

  // Apply client-side filtering
  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter(n => isUnread(n))
      case "quotes":
        return notifications.filter(n => QUOTE_TYPES.includes(n.type))
      case "trades":
        return notifications.filter(n => TRADE_TYPES.includes(n.type))
      case "rates":
        return notifications.filter(n => RATE_TYPES.includes(n.type))
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
    if (notification.referenceType === "Quote") {
      router.push("/dealer/quotes")
    } else if (notification.referenceType === "Trade") {
      router.push("/dealer/trades")
    }
  }

  const handleRefresh = () => {
    fetchNotifications({ page: 1 })
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "quotes", label: "Quotes" },
    { key: "trades", label: "Trades" },
    { key: "rates", label: "Rates" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DashboardHeader
        title="Notifications"
        subtitle="Monitor quote requests and trade updates"
        action={unreadCount > 0 ? {
          label: "Mark all read",
          onClick: handleMarkAllAsRead,
        } : undefined}
      />

      {/* Urgent Alert */}
      {urgentCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-amber-400">{urgentCount} Action Required</p>
              <p className="text-sm text-muted-foreground">New quote requests or deposits awaiting your response</p>
            </div>
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
          <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-muted-foreground">Unread</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Processed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pagination.total - unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-muted-foreground">Rate Updates</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {notifications.filter(n => n.type === "RateUpdated").length}
          </p>
        </div>
      </div>

      {/* Filters */}
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
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
                {filter === "unread" ? "All caught up! No pending actions." : "No notifications match your filter."}
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
    </motion.div>
  )
}
