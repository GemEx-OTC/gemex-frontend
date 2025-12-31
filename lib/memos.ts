// Memo types and utilities for dealer-admin communication

export type MemoStatus = "open" | "in_progress" | "resolved" | "closed"
export type MemoPriority = "low" | "medium" | "high" | "urgent"
export type MemoCategory = "trade_issue" | "rate_request" | "client_concern" | "system_issue" | "general" | "escalation"

export interface Memo {
  id: string
  subject: string
  message: string
  category: MemoCategory
  priority: MemoPriority
  status: MemoStatus
  createdBy: {
    id: string
    name: string
    role: "dealer" | "admin"
  }
  assignedTo?: {
    id: string
    name: string
    role: "dealer" | "admin"
  }
  referenceType?: "trade" | "quote" | "user"
  referenceId?: string
  replies: MemoReply[]
  createdAt: string
  updatedAt: string
}

export interface MemoReply {
  id: string
  message: string
  createdBy: {
    id: string
    name: string
    role: "dealer" | "admin"
  }
  createdAt: string
}

export const MEMO_STATUS_CONFIG: Record<MemoStatus, { label: string; color: string; bg: string }> = {
  open: {
    label: "Open",
    color: "text-blue-400",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-400",
    bg: "bg-green-500/20 border-green-500/30",
  },
  closed: {
    label: "Closed",
    color: "text-gray-400",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
}

export const MEMO_PRIORITY_CONFIG: Record<MemoPriority, { label: string; color: string; bg: string }> = {
  low: {
    label: "Low",
    color: "text-gray-400",
    bg: "bg-gray-500/20 border-gray-500/30",
  },
  medium: {
    label: "Medium",
    color: "text-blue-400",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  high: {
    label: "High",
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-400",
    bg: "bg-red-500/20 border-red-500/30",
  },
}

export const MEMO_CATEGORY_CONFIG: Record<MemoCategory, { label: string; icon: string }> = {
  trade_issue: { label: "Trade Issue", icon: "💼" },
  rate_request: { label: "Rate Request", icon: "📈" },
  client_concern: { label: "Client Concern", icon: "👤" },
  system_issue: { label: "System Issue", icon: "⚠️" },
  general: { label: "General", icon: "📝" },
  escalation: { label: "Escalation", icon: "🚨" },
}

export function formatMemoDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
