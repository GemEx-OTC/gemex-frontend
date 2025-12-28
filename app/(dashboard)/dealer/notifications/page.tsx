"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { Notification } from "@/lib/notifications"
import { Bell, CheckCheck, Filter, Inbox, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock notifications for dealer
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "dealer1",
    type: "QuoteGenerated",
    title: "New Quote Request",
    message: "Client John D. requested a quote for 15,000 USDT. Review and respond within 5 minutes.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "Quote",
    referenceId: "quote123",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    userId: "dealer1",
    type: "TradeCreated",
    title: "Trade Initiated",
    message: "Trade #TRD-2024-001 created. Client accepted quote for 8,500 USDT at ₦1,568/USD.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "Trade",
    referenceId: "trade456",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "3",
    userId: "dealer1",
    type: "DepositConfirmed",
    title: "Crypto Deposit Received",
    message: "5,000 USDT confirmed for Trade #TRD-2024-002. Initiate Naira payout to client.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: true, sentAt: new Date().toISOString() } },
    referenceType: "Trade",
    referenceId: "trade789",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "4",
    userId: "dealer1",
    type: "RateUpdated",
    title: "Exchange Rate Updated",
    message: "Admin updated USDT/NGN rate to ₦1,572. New rate effective immediately.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: false }, sms: { sent: false } },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "5",
    userId: "dealer1",
    type: "PayoutSuccess",
    title: "Payout Completed",
    message: "Successfully sent ₦7,825,000 to client for Trade #TRD-2024-003.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "Trade",
    referenceId: "trade101",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "6",
    userId: "dealer1",
    type: "QuoteRejected",
    title: "Quote Declined",
    message: "Client declined quote for 20,000 USDT. Reason: Rate too low.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: false }, sms: { sent: false } },
    referenceType: "Quote",
    referenceId: "quote555",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

type FilterType = "all" | "unread" | "quotes" | "trades" | "rates"

export default function DealerNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<FilterType>("all")

  const unreadCount = notifications.filter(n => !n.channels.inApp.readAt).length
  const urgentCount = notifications.filter(n => !n.channels.inApp.readAt && ["QuoteGenerated", "DepositConfirmed"].includes(n.type)).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.channels.inApp.readAt
    if (filter === "quotes") return ["QuoteGenerated", "QuoteAccepted", "QuoteRejected", "QuoteExpired"].includes(n.type)
    if (filter === "trades") return ["TradeCreated", "DepositConfirmed", "PayoutSuccess", "PayoutFailed"].includes(n.type)
    if (filter === "rates") return n.type === "RateUpdated"
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
      router.push("/dealer/quotes")
    } else if (notification.referenceType === "Trade") {
      router.push("/dealer/trades")
    }
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
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
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
          <p className="text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-muted-foreground">Rate Updates</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.type === "RateUpdated").length}</p>
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
                {filter === "unread" ? "All caught up! No pending actions." : "No notifications match your filter."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
