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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-1">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[#B0B0B8]">{subtitle}</p>}
      </div>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all whitespace-nowrap self-start sm:self-auto"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
