"use client"

import { motion } from "framer-motion"
import { Check, ExternalLink } from "lucide-react"
import { Notification, NOTIFICATION_CONFIG, formatTimeAgo } from "@/lib/notifications"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onNavigate?: (notification: Notification) => void
}

export function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type]
  const isRead = !!notification.channels.inApp.readAt

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
        isRead
          ? "bg-card/50 border-border/50"
          : `${config.bg} border`
      }`}
      onClick={() => onNavigate?.(notification)}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
          isRead ? "bg-muted" : config.bg
        }`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold truncate ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm mb-2 line-clamp-2 ${isRead ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
              {config.category}
            </span>

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
              
              {!isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
