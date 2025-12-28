"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { NotificationItem } from "@/components/notification-item"
import { Notification } from "@/lib/notifications"
import { Bell, CheckCheck, Filter, Inbox, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock notifications for admin
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "admin1",
    type: "KycStatusChange",
    title: "KYC Submission Pending",
    message: "New KYC submission from Sarah M. requires review. Documents uploaded 5 minutes ago.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "User",
    referenceId: "user123",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    userId: "admin1",
    type: "AdminAction",
    title: "High Volume Trade Alert",
    message: "Trade #TRD-2024-050 exceeds ₦50M threshold. Client: Premium Corp. Amount: ₦75,000,000.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: true, sentAt: new Date().toISOString() } },
    referenceType: "Trade",
    referenceId: "trade050",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "3",
    userId: "admin1",
    type: "AccountStatusChange",
    title: "Account Flagged",
    message: "User account flagged for suspicious activity. Multiple failed login attempts detected.",
    channels: { inApp: { sent: true }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "User",
    referenceId: "user456",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "4",
    userId: "admin1",
    type: "RateUpdated",
    title: "Rate Change Applied",
    message: "Dealer James updated USDT/NGN rate from ₦1,565 to ₦1,572. Change: +0.45%.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: false }, sms: { sent: false } },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "5",
    userId: "admin1",
    type: "PayoutFailed",
    title: "Payout Failed",
    message: "Payout of ₦2,500,000 failed for Trade #TRD-2024-048. Reason: Invalid bank account.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: true, sentAt: new Date().toISOString() } },
    referenceType: "Trade",
    referenceId: "trade048",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "6",
    userId: "admin1",
    type: "TradeCreated",
    title: "Large Trade Created",
    message: "New trade initiated: 50,000 USDT by VIP Client. Assigned to Dealer Mike.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "Trade",
    referenceId: "trade051",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "7",
    userId: "admin1",
    type: "KycStatusChange",
    title: "KYC Approved",
    message: "KYC verification approved for Michael O. Full trading access granted.",
    channels: { inApp: { sent: true, readAt: new Date().toISOString() }, email: { sent: true, sentAt: new Date().toISOString() }, sms: { sent: false } },
    referenceType: "User",
    referenceId: "user789",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

type FilterType = "all" | "unread" | "kyc" | "trades" | "system"

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<FilterType>("all")

  const unreadCount = notifications.filter(n => !n.channels.inApp.readAt).length
  const kycPendingCount = notifications.filter(n => !n.channels.inApp.readAt && n.type === "KycStatusChange").length

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.channels.inApp.readAt
    if (filter === "kyc") return ["KycStatusChange", "AccountStatusChange"].includes(n.type)
    if (filter === "trades") return ["TradeCreated", "DepositConfirmed", "PayoutSuccess", "PayoutFailed"].includes(n.type)
    if (filter === "system") return ["AdminAction", "RateUpdated"].includes(n.type)
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
    if (notification.referenceType === "User") {
      router.push("/admin/users")
    } else if (notification.referenceType === "Trade") {
      router.push("/admin/dashboard")
    }
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
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-red-400" />
            <span className="text-sm text-muted-foreground">Unread</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
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
            <span className="text-sm text-muted-foreground">User Alerts</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.referenceType === "User").length}</p>
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
                {filter === "unread" ? "All caught up! No pending alerts." : "No notifications match your filter."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
