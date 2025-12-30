"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0D0D12] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated 500 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                borderColor: ["rgba(239, 68, 68, 0.4)", "rgba(239, 68, 68, 0.8)", "rgba(239, 68, 68, 0.4)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </motion.div>
            <motion.span
              className="text-[100px] md:text-[140px] font-bold bg-gradient-to-br from-red-500 to-[#641AE4] bg-clip-text text-transparent leading-none"
            >
              500
            </motion.span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#F0F0F0] mb-3">
            Something Went Wrong
          </h1>
          <p className="text-[#B0B0B8] mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Our team has been notified. 
            Please try again or return home.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-[#0D0D12] bg-[#C8F55A] hover:bg-[#b8e550] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <a
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] hover:bg-[#641AE4]/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </a>
        </motion.div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-[#1E1E2B] border border-[#2D2D3D] rounded-lg text-left"
          >
            <p className="text-xs text-[#B0B0B8] mb-2">Error Details:</p>
            <code className="text-xs text-red-400 break-all">{error.message}</code>
          </motion.div>
        )}

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#641AE4]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  )
}
