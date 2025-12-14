"use client"

import { motion } from "framer-motion"

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  accent?: "primary" | "secondary" | "accent" | "success" | "warning"
  isHighlight?: boolean
}

export function MetricCard({ label, value, change, accent = "primary", isHighlight = false }: MetricCardProps) {
  const getAccentClasses = () => {
    switch (accent) {
      case "secondary":
        return "text-secondary"
      case "accent":
        return "text-accent"
      case "success":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-primary"
    }
  }

  const getBorderClasses = () => {
    if (isHighlight) {
      switch (accent) {
        case "secondary":
          return "bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary/40"
        case "accent":
          return "bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/40"
        case "success":
          return "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40"
        case "warning":
          return "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40"
        default:
          return "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40"
      }
    }
    return "bg-card border border-border hover:border-primary/40"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border transition-all ${getBorderClasses()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
      </div>
      <motion.div
        animate={{ opacity: [0.8, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className={`text-2xl font-bold mb-2 ${accent === "secondary" ? getAccentClasses() : "text-foreground"}`}
      >
        {value}
      </motion.div>
      {change && <div className={`text-xs font-medium ${getAccentClasses()}`}>{change}</div>}
    </motion.div>
  )
}
