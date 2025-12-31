"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

type AlertType = "success" | "error" | "warning" | "info"

interface Alert {
  id: string
  type: AlertType
  title: string
  message?: string
  duration?: number
}

interface AlertContextType {
  showAlert: (alert: Omit<Alert, "id">) => void
  hideAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | null>(null)

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}

const alertConfig: Record<AlertType, { icon: typeof CheckCircle; bg: string; border: string; iconColor: string; titleColor: string }> = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-400",
    titleColor: "text-green-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    titleColor: "text-amber-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    titleColor: "text-blue-400",
  },
}

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const config = alertConfig[alert.type]
  const Icon = config.icon

  useEffect(() => {
    if (alert.duration !== 0) {
      const timer = setTimeout(onDismiss, alert.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [alert.duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${config.titleColor}`}>{alert.title}</p>
          {alert.message && <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  )
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const showAlert = useCallback((alert: Omit<Alert, "id">) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setAlerts((prev) => [...prev, { ...alert, id }])
  }, [])

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="sync">
          {alerts.map((alert) => (
            <div key={alert.id} className="pointer-events-auto">
              <AlertItem alert={alert} onDismiss={() => hideAlert(alert.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  )
}

// Inline alert component for static alerts within content
interface InlineAlertProps {
  type: AlertType
  title: string
  message?: string
  onDismiss?: () => void
  className?: string
}

export function InlineAlert({ type, title, message, onDismiss, className = "" }: InlineAlertProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${config.titleColor}`}>{title}</p>
          {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  )
}
