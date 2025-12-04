"use client"

import { motion } from "framer-motion"

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  accent?: "violet" | "lime" | "purple"
  isHighlight?: boolean
}

export function MetricCard({ label, value, change, accent = "violet", isHighlight = false }: MetricCardProps) {
  const accentColors = {
    violet: "#641AE4",
    lime: "#C8F55A",
    purple: "#9A24D2",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border transition-all ${
        isHighlight
          ? "bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border-[#641AE4]/40"
          : "bg-[#1E1E2B]/60 border-[#2D2D3D]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[#B0B0B8] text-sm font-medium">{label}</span>
      </div>
      <motion.div
        animate={{ opacity: [0.8, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className={`text-2xl font-bold mb-2 ${accent === "lime" ? "text-[#C8F55A]" : "text-[#F0F0F0]"}`}
      >
        {value}
      </motion.div>
      {change && <div className="text-xs text-[#C8F55A] font-medium">{change}</div>}
    </motion.div>
  )
}
