"use client"

import { motion } from "framer-motion"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm sm:text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-sm hover:shadow-md whitespace-nowrap self-start sm:self-auto"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
