"use client"

import { motion } from "framer-motion"
import { Check, ExternalLink, Trash2 } from "lucide-react"
import { NOTIFICATION_CONFIG, PRIORITY_CONFIG, formatTimeAgo, getNotificationId, isUnread } from "@/lib/notifications"
import type { Notification } from "@/lib/api/notifications"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onNavigate?: (notification: Notification) => void
  onDelete?: (id: string) => void
  showPriority?: boolean
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onNavigate, 
  onDelete,
  showPriority = false 
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type] || {
    icon: '🔔',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/20',
    category: 'Other',
  }
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.normal
  const unread = isUnread(notification)
  const notificationId = getNotificationId(notification)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
        unread
          ? `${config.bg} border`
          : "bg-card/50 border-border/50"
      }`}
      onClick={() => onNavigate?.(notification)}
    >
      {/* Unread indicator */}
      {unread && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          unread ? config.bg : "bg-muted"
        }`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm mb-2 line-clamp-2 ${unread ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                {config.category}
              </span>
              {showPriority && notification.priority !== 'normal' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.bg} ${priorityConfig.color}`}>
                  {notification.priority}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notification.referenceId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate?.(notification)
                  }}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </button>
              )}
              
              {unread && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notificationId)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark read
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(notificationId)
                  }}
                  className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
