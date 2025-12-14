"use client"

import type React from "react"

import { motion } from "framer-motion"

interface DataTableProps {
  columns: {
    key: string
    label: string
    width?: string
    className?: string
    render?: (value: any, row: Record<string, any>) => React.ReactNode
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
    <div className="w-full">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-4 lg:px-6 py-4 text-left text-sm md:text-base font-bold text-foreground/80 bg-muted/30 ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
          {data.map((row, idx) => (
            <motion.tr
              key={idx}
              variants={rowVariants}
              onClick={() => onRowClick?.(row)}
              className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {columns.map((col) => (
                <td 
                  key={`${idx}-${col.key}`} 
                  className={`px-4 lg:px-6 py-5 text-sm md:text-base font-medium text-foreground ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  )
}
