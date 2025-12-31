"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuditLogs } from "@/lib/hooks/use-admin"
import { Loader2, AlertTriangle, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type SeverityFilter = "all" | "info" | "warning" | "critical"

// Format action names for display
const formatAction = (action: string) => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Get severity badge styles - improved readability
const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-300 border border-red-500/30"
    case "warning":
      return "bg-amber-500/20 text-amber-300 border border-amber-500/30"
    default:
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
  }
}

// Get action badge styles based on action type - improved readability
const getActionStyles = (action: string) => {
  if (action.includes('SUSPEND') || action.includes('REJECT') || action.includes('FAIL')) {
    return "bg-red-500/15 text-red-300 border border-red-500/25"
  }
  if (action.includes('CREATE') || action.includes('VERIFY') || action.includes('SETTLE') || action.includes('REACTIVATE')) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
  }
  if (action.includes('UPDATE') || action.includes('CHANGE') || action.includes('RESET')) {
    return "bg-amber-500/15 text-amber-300 border border-amber-500/25"
  }
  if (action.includes('LOGIN') || action.includes('LOGOUT')) {
    return "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
  }
  return "bg-slate-500/15 text-slate-300 border border-slate-500/25"
}

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useAuditLogs({
    severity: severityFilter !== "all" ? severityFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: 30,
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader
        title="Audit Logs"
        subtitle="Complete record of all system activities and administrative actions"
      />

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            placeholder="Search by actor email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] placeholder-[#B0B0B8] px-4 py-3 rounded transition-all focus:outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            {(["all", "info", "warning", "critical"] as const).map((sev) => (
              <motion.button
                key={sev}
                onClick={() => { setSeverityFilter(sev); setPage(1); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  severityFilter === sev 
                    ? sev === "critical" 
                      ? "bg-red-500 text-white"
                      : sev === "warning"
                        ? "bg-amber-500 text-white"
                        : sev === "info"
                          ? "bg-blue-500 text-white"
                          : "bg-[#641AE4] text-white"
                    : "bg-[#2D2D3D] text-[#B0B0B8] hover:text-[#F0F0F0]"
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#641AE4]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Failed to load audit logs</p>
        </div>
      )}

      {/* Audit Logs */}
      {!isLoading && !error && data && (
        <>
          <div className="space-y-3">
            {data.logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="p-4 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg hover:border-[#3D3D4D] transition-colors"
              >
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Action Badge - improved readability */}
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${getActionStyles(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                    {/* Severity Indicator */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityStyles(log.severity)}`}>
                      {log.severity}
                    </span>
                  </div>
                  <span className="text-[#B0B0B8] text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#808090] text-xs uppercase tracking-wide">Actor</span>
                    <div className="text-[#F0F0F0] font-medium mt-1">{log.actor}</div>
                    {log.actorRole && (
                      <div className="text-[#808090] text-xs mt-0.5">{log.actorRole}</div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[#808090] text-xs uppercase tracking-wide">Details</span>
                    <div className="text-[#E0E0E0] mt-1">{log.details}</div>
                  </div>
                  <div>
                    <span className="text-[#808090] text-xs uppercase tracking-wide">IP Address</span>
                    <div className="text-[#B0B0B8] font-mono text-xs mt-1">{log.ipAddress || 'N/A'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2D2D3D]">
              <p className="text-sm text-[#B0B0B8]">
                Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3D3D4D] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#2D2D3D] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3D3D4D] transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {data.logs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <FileText className="w-12 h-12 text-[#2D2D3D] mx-auto mb-3" />
              <p className="text-[#B0B0B8]">No audit logs found</p>
              {(searchQuery || severityFilter !== "all") && (
                <p className="text-[#808090] text-sm mt-1">Try adjusting your filters</p>
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
