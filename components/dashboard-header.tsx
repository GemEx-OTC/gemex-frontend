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
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#F0F0F0] mb-1">{title}</h1>
        {subtitle && <p className="text-[#B0B0B8]">{subtitle}</p>}
      </div>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
