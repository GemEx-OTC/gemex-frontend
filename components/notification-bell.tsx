"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCheck, ExternalLink } from "lucide-react"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { NOTIFICATION_CONFIG, formatTimeAgo, isUnread, getNotificationId } from "@/lib/notifications"
import type { Notification } from "@/lib/api/notifications"
import { useRouter } from "next/navigation"

interface NotificationBellProps {
  basePath: string // e.g., "/client", "/dealer", "/admin"
}

export function NotificationBell({ basePath }: NotificationBellProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    autoFetch: true,
    pollInterval: 30000,
    filters: { limit: 5 },
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const handleNotificationClick = (notification: Notification) => {
    const id = getNotificationId(notification)
    if (isUnread(notification)) {
      markAsRead(id)
    }
    setIsOpen(false)
    
    // Navigate based on reference type
    if (notification.referenceType === "Quote") {
      router.push(`${basePath}/quotes`)
    } else if (notification.referenceType === "Trade") {
      router.push(basePath === "/admin" ? `${basePath}/dashboard` : `${basePath}/trades`)
    } else if (notification.referenceType === "User" || notification.referenceType === "KYC") {
      router.push(basePath === "/admin" ? `${basePath}/users` : `${basePath}/settings`)
    } else {
      router.push(`${basePath}/notifications`)
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    router.push(`${basePath}/notifications`)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-xl bg-card border border-border shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const config = NOTIFICATION_CONFIG[notification.type] || {
                    icon: '🔔',
                    color: 'text-gray-400',
                    bg: 'bg-gray-500/10',
                    category: 'Other',
                  }
                  const unread = isUnread(notification)
                  const id = getNotificationId(notification)

                  return (
                    <div
                      key={id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                        unread ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${config.bg}`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {unread && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <button
                onClick={handleViewAll}
                className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1"
              >
                View all notifications
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
