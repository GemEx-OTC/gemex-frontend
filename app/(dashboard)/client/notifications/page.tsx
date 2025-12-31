"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { ROLE_NOTIFICATIONS, isUnread, getNotificationId } from "@/lib/notifications"
import type { Notification, NotificationType } from "@/lib/api/notifications"
import { Bell, CheckCheck, Filter, Inbox, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

type FilterType = "all" | "unread" | "quotes" | "transactions" | "account"

const QUOTE_TYPES: NotificationType[] = ['QuoteGenerated', 'QuoteAccepted', 'QuoteRejected', 'QuoteExpired']
const TRANSACTION_TYPES: NotificationType[] = ['DepositConfirmed', 'PayoutSuccess', 'PayoutFailed', 'TradeCreated']
const ACCOUNT_TYPES: NotificationType[] = ['KycStatusChange', 'AccountStatusChange', 'WelcomeMessage']

export default function ClientNotificationsPage() {
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
    pollInterval: 30000, // Poll every 30 seconds
    filters: { limit: 20 },
  })

  // Apply client-side filtering based on filter type
  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter(n => isUnread(n))
      case "quotes":
        return notifications.filter(n => QUOTE_TYPES.includes(n.type))
      case "transactions":
        return notifications.filter(n => TRANSACTION_TYPES.includes(n.type))
      case "account":
        return notifications.filter(n => ACCOUNT_TYPES.includes(n.type))
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
      router.push("/client/trade")
    } else if (notification.referenceType === "Trade") {
      router.push("/client/history")
    } else if (notification.referenceType === "User" || notification.referenceType === "KYC") {
      router.push("/client/settings")
    }
  }

  const handleRefresh = () => {
    fetchNotifications({ page: 1 })
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "quotes", label: "Quotes" },
    { key: "transactions", label: "Transactions" },
    { key: "account", label: "Account" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DashboardHeader
        title="Notifications"
        subtitle="Stay updated on your trades and account activity"
        action={unreadCount > 0 ? {
          label: "Mark all read",
          onClick: handleMarkAllAsRead,
        } : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Unread</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Read</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pagination.total - unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-muted-foreground">Filtered</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{filteredNotifications.length}</p>
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
                {filter === "unread" ? "You're all caught up!" : "No notifications match your filter."}
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
