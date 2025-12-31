// Notification types and utilities for GemEx OTC Platform
// Re-export API types for convenience
export type { 
  NotificationType, 
  NotificationPriority, 
  Notification,
  NotificationFilters,
  NotificationsResponse,
  NotificationStats,
} from './api/notifications';

import type { NotificationType, Notification } from './api/notifications';

export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string
  color: string
  bg: string
  category: string
}> = {
  QuoteGenerated: {
    icon: '📋',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    category: 'Quotes',
  },
  QuoteAccepted: {
    icon: '✅',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    category: 'Quotes',
  },
  QuoteRejected: {
    icon: '❌',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    category: 'Quotes',
  },
  QuoteExpired: {
    icon: '⏰',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    category: 'Quotes',
  },
  DepositConfirmed: {
    icon: '💰',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    category: 'Transactions',
  },
  PayoutSuccess: {
    icon: '🏦',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    category: 'Transactions',
  },
  PayoutFailed: {
    icon: '⚠️',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    category: 'Transactions',
  },
  AccountStatusChange: {
    icon: '👤',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    category: 'Account',
  },
  KycStatusChange: {
    icon: '🛡️',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    category: 'Account',
  },
  AdminAction: {
    icon: '⚡',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    category: 'System',
  },
  RateUpdated: {
    icon: '📈',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    category: 'Rates',
  },
  TradeCreated: {
    icon: '💱',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    category: 'Transactions',
  },
  SystemAlert: {
    icon: '🔔',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    category: 'System',
  },
  SecurityAlert: {
    icon: '🔒',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    category: 'Security',
  },
  WelcomeMessage: {
    icon: '👋',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
    category: 'Account',
  },
}

// Priority colors
export const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
  normal: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  urgent: { color: 'text-red-400', bg: 'bg-red-500/10' },
}

// Role-specific notification types
export const ROLE_NOTIFICATIONS = {
  client: [
    'QuoteGenerated',
    'QuoteAccepted',
    'QuoteRejected',
    'QuoteExpired',
    'DepositConfirmed',
    'PayoutSuccess',
    'PayoutFailed',
    'KycStatusChange',
    'AccountStatusChange',
    'WelcomeMessage',
  ] as NotificationType[],
  dealer: [
    'QuoteGenerated',
    'QuoteAccepted',
    'QuoteRejected',
    'TradeCreated',
    'DepositConfirmed',
    'PayoutSuccess',
    'PayoutFailed',
    'RateUpdated',
    'SystemAlert',
  ] as NotificationType[],
  admin: [
    'QuoteGenerated',
    'QuoteAccepted',
    'TradeCreated',
    'DepositConfirmed',
    'PayoutSuccess',
    'PayoutFailed',
    'KycStatusChange',
    'AccountStatusChange',
    'AdminAction',
    'RateUpdated',
    'SystemAlert',
    'SecurityAlert',
  ] as NotificationType[],
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Helper to check if notification is unread
export function isUnread(notification: Notification): boolean {
  return !notification.channels.inApp.readAt
}

// Helper to get notification ID (handles both _id and id)
export function getNotificationId(notification: Notification): string {
  return notification._id || (notification as any).id
}
