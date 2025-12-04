"use client"

import type React from "react"

import { motion } from "framer-motion"

interface DataTableProps {
  columns: {
    key: string
    label: string
    render?: (value: any) => React.ReactNode
  }[]
  data: Record<string, any>[]
  onRowClick?: (row: Record<string, any>) => void
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2D2D3D]">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B8] bg-[#1E1E2B]/40">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {data.map((row, idx) => (
              <motion.tr
                key={idx}
                variants={rowVariants}
                onClick={() => onRowClick?.(row)}
                className="border-b border-[#2D2D3D] hover:bg-[#2D2D3D]/50 transition-colors cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={`${idx}-${col.key}`} className="px-6 py-4 text-sm text-[#F0F0F0]">
                    {col.render ? col.render(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.div>
        </tbody>
      </table>
    </div>
  )
}
