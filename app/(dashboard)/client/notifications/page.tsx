"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { Notification, NOTIFICATION_CONFIG, ROLE_NOTIFICATIONS } from "@/lib/notifications"
import { Bell, CheckCheck, Filter, Inbox } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock notifications for client
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "user1",
    type: "QuoteGenerated",
    title: "New Quote Available",
    message: "Your quote request for 5,000 USDT has been processed. Rate: ₦1,565/USD. Valid for 15 minutes.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "Quote",
    referenceId: "quote123",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    userId: "user1",
    type: "DepositConfirmed",
    title: "Deposit Confirmed",
    message: "Your deposit of 2,500 USDT has been confirmed on the blockchain. Processing payout now.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: true, sentAt: new Date().toISOString() } },
    referenceType: "Trade",
    referenceId: "trade456",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "3",
    userId: "user1",
    type: "PayoutSuccess",
    title: "Payout Successful",
    message: "₦3,912,500 has been sent to your Access Bank account ending in 4521.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: true, sentAt: new Date().toISOString() } },
    referenceType: "Trade",
    referenceId: "trade789",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "4",
    userId: "user1",
    type: "KycStatusChange",
    title: "KYC Verification Complete",
    message: "Your identity has been verified. You now have access to all trading features.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    userId: "user1",
    type: "QuoteExpired",
    title: "Quote Expired",
    message: "Your quote for 10,000 USDT has expired. Request a new quote to continue.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: false }, sms: { sent: false } },
    referenceType: "Quote",
    referenceId: "quote999",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

type FilterType = "all" | "unread" | "quotes" | "transactions" | "account"

export default function ClientNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<FilterType>("all")

  const unreadCount = notifications.filter(n => !n.channels.inApp.readAt).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.channels.inApp.readAt
    if (filter === "quotes") return ["QuoteGenerated", "QuoteAccepted", "QuoteRejected", "QuoteExpired"].includes(n.type)
    if (filter === "transactions") return ["DepositConfirmed", "PayoutSuccess", "PayoutFailed", "TradeCreated"].includes(n.type)
    if (filter === "account") return ["KycStatusChange", "AccountStatusChange"].includes(n.type)
    return true
  })

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, readAt: new Date().toISOString() } } }
          : n
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        channels: { ...n.channels, inApp: { ...n.channels.inApp, readAt: n.channels.inApp.readAt || new Date().toISOString() } }
      }))
    )
  }

  const handleNavigate = (notification: Notification) => {
    handleMarkAsRead(notification.id)
    if (notification.referenceType === "Quote") {
      router.push("/client/trade")
    } else if (notification.referenceType === "Trade") {
      router.push("/client/history")
    }
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
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
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
          <p className="text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
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
      <div className="flex flex-wrap gap-2 mb-6">
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
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            ))
          ) : (
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
    </motion.div>
  )
}
