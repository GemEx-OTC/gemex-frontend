"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuditLogs } from "@/lib/hooks/use-admin"
import { 
  Loader2, 
  AlertTriangle, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  RefreshCw,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

type SeverityFilter = "all" | "info" | "warning" | "critical"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Format action names for display
const formatAction = (action: string) => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Get icon for action type
const getActionIcon = (action: string) => {
  if (action.includes('LOGIN')) return <LogIn className="w-4 h-4" />
  if (action.includes('LOGOUT')) return <LogOut className="w-4 h-4" />
  if (action.includes('SUSPEND') || action.includes('REJECT')) return <UserX className="w-4 h-4" />
  if (action.includes('VERIFY') || action.includes('REACTIVATE')) return <UserCheck className="w-4 h-4" />
  if (action.includes('CREATE') || action.includes('REGISTER')) return <CheckCircle className="w-4 h-4" />
  if (action.includes('UPDATE') || action.includes('CHANGE') || action.includes('RESET')) return <RefreshCw className="w-4 h-4" />
  if (action.includes('TRADE') || action.includes('QUOTE') || action.includes('PAYOUT')) return <CreditCard className="w-4 h-4" />
  if (action.includes('SETTINGS') || action.includes('RATE')) return <Settings className="w-4 h-4" />
  if (action.includes('FAIL') || action.includes('ERROR')) return <AlertCircle className="w-4 h-4" />
  return <Shield className="w-4 h-4" />
}

// Get severity config
const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-gradient-to-r from-red-500/20 to-red-500/10",
        border: "border-red-500/40",
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-300 border-red-500/30",
        dot: "bg-red-500",
        icon: <AlertTriangle className="w-3.5 h-3.5" />
      }
    case "warning":
      return {
        bg: "bg-gradient-to-r from-amber-500/20 to-amber-500/10",
        border: "border-amber-500/40",
        text: "text-amber-400",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        dot: "bg-amber-500",
        icon: <AlertCircle className="w-3.5 h-3.5" />
      }
    default:
      return {
        bg: "bg-gradient-to-r from-blue-500/20 to-blue-500/10",
        border: "border-blue-500/40",
        text: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        dot: "bg-blue-500",
        icon: <CheckCircle className="w-3.5 h-3.5" />
      }
  }
}

// Get action category styles
const getActionCategoryStyles = (action: string) => {
  if (action.includes('SUSPEND') || action.includes('REJECT') || action.includes('FAIL')) {
    return {
      bg: "bg-gradient-to-r from-red-500/15 to-rose-500/10",
      border: "border-red-500/30",
      text: "text-red-300"
    }
  }
  if (action.includes('CREATE') || action.includes('VERIFY') || action.includes('SETTLE') || action.includes('REACTIVATE') || action.includes('REGISTER')) {
    return {
      bg: "bg-gradient-to-r from-emerald-500/15 to-green-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300"
    }
  }
  if (action.includes('UPDATE') || action.includes('CHANGE') || action.includes('RESET')) {
    return {
      bg: "bg-gradient-to-r from-amber-500/15 to-yellow-500/10",
      border: "border-amber-500/30",
      text: "text-amber-300"
    }
  }
  if (action.includes('LOGIN') || action.includes('LOGOUT')) {
    return {
      bg: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-300"
    }
  }
  if (action.includes('TRADE') || action.includes('QUOTE') || action.includes('PAYOUT') || action.includes('DEPOSIT')) {
    return {
      bg: "bg-gradient-to-r from-purple-500/15 to-violet-500/10",
      border: "border-purple-500/30",
      text: "text-purple-300"
    }
  }
  return {
    bg: "bg-gradient-to-r from-slate-500/15 to-gray-500/10",
    border: "border-slate-500/30",
    text: "text-slate-300"
  }
}

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useAuditLogs({
    severity: severityFilter !== "all" ? severityFilter : undefined,
    search: searchQuery || undefined,
    page,
    limit: 25,
  })

  // Stats from current page data
  const stats = data ? {
    total: data.pagination.total,
    critical: data.logs.filter(l => l.severity === 'critical').length,
    warning: data.logs.filter(l => l.severity === 'warning').length,
    info: data.logs.filter(l => l.severity === 'info').length,
  } : { total: 0, critical: 0, warning: 0, info: 0 }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <DashboardHeader
        title="Audit Logs"
        subtitle="Complete record of all system activities and administrative actions"
      />

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-2 border-indigo-500/40">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border-2 border-red-500/40">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-red-400">Critical</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.warning}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Info</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.info}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by actor email or details..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            
            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {(["all", "critical", "warning", "info"] as const).map((sev) => {
                  const isActive = severityFilter === sev
                  const config = sev !== "all" ? getSeverityConfig(sev) : null
                  
                  return (
                    <motion.button
                      key={sev}
                      onClick={() => { setSeverityFilter(sev); setPage(1); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                        isActive 
                          ? sev === "all"
                            ? "bg-primary text-primary-foreground border-primary"
                            : `${config?.bg} ${config?.text} ${config?.border}`
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {sev !== "all" && config?.icon}
                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="p-4 rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium mb-2">Failed to load audit logs</p>
          <p className="text-muted-foreground text-sm mb-4">Please try again or contact support</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        </motion.div>
      )}

      {/* Audit Logs List */}
      {!isLoading && !error && data && (
        <>
          <AnimatePresence mode="wait">
            {data.logs.length > 0 ? (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {data.logs.map((log, idx) => {
                  const severityConfig = getSeverityConfig(log.severity)
                  const actionStyles = getActionCategoryStyles(log.action)
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${severityConfig.bg} ${severityConfig.border}`}
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Action Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${actionStyles.bg} ${actionStyles.border} ${actionStyles.text}`}>
                            {getActionIcon(log.action)}
                            {formatAction(log.action)}
                          </span>
                          
                          {/* Severity Badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${severityConfig.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${severityConfig.dot}`}></span>
                            {log.severity}
                          </span>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </div>
                          <div className="text-xs text-muted-foreground/70 mt-0.5">
                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Actor */}
                        <div className="md:col-span-3">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actor</span>
                          <div className="mt-1">
                            <p className="text-foreground font-medium text-sm truncate">{log.actor}</p>
                            {log.actorRole && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                                {log.actorRole}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Details */}
                        <div className="md:col-span-6">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</span>
                          <p className="text-foreground/90 text-sm mt-1 leading-relaxed">{log.details}</p>
                        </div>
                        
                        {/* IP Address */}
                        <div className="md:col-span-3">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</span>
                          <p className="text-muted-foreground font-mono text-xs mt-1 bg-background/50 px-2 py-1 rounded inline-block">
                            {log.ipAddress || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">No audit logs found</p>
                {(searchQuery || severityFilter !== "all") && (
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border"
            >
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{((page - 1) * 25) + 1}</span> to{' '}
                <span className="font-medium text-foreground">{Math.min(page * 25, data.pagination.total)}</span> of{' '}
                <span className="font-medium text-foreground">{data.pagination.total.toLocaleString()}</span> events
              </p>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    let pageNum: number
                    if (data.pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= data.pagination.pages - 2) {
                      pageNum = data.pagination.pages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:border-primary/50 transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
