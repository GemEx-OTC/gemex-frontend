"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Shield, AlertTriangle, LogOut } from "lucide-react"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [exchangeRates, setExchangeRates] = useState({
    btcNgn: "43500000",
    usdtNgn: "1565",
    usdcNgn: "1563",
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [twoFactorError, setTwoFactorError] = useState("")

  const handleSaveRates = () => {
    setShowConfirmModal(true)
    setTwoFactorCode("")
    setTwoFactorError("")
  }

  const handleConfirmSave = () => {
    if (twoFactorCode !== "123456") {
      setTwoFactorError("Invalid 2FA code. Please try again.")
      return
    }

    setTwoFactorError("")
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setShowConfirmModal(false)
      setSaved(true)
      
      // Neon Lime flash effect
      setTimeout(() => setSaved(false), 3000)
    }, 1500)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="System Settings" subtitle="Configure exchange rates and platform parameters" />

      {/* Exchange Rates */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 10 }} className="max-w-2xl">
        <div className="p-8 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Global Exchange Rates</h2>
          <p className="text-sm text-[#B0B0B8] mb-6">These rates are used for auto-payout calculations on settled trades</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDT to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.usdtNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, usdtNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDC to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.usdcNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, usdcNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">BTC to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.btcNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, btcNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/20 rounded-lg">
            <p className="text-[#C8F55A] text-sm font-medium">
              ⚠️ Rate changes take effect immediately and affect all new quotes
            </p>
          </div>

          <motion.button
            onClick={handleSaveRates}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={saved ? { backgroundColor: ["#C8F55A", "#C8F55A", "#641AE4"] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
              saved
                ? "bg-[#C8F55A] text-[#1E1E2B] shadow-lg shadow-[#C8F55A]/50"
                : "bg-[#C8F55A] text-[#1E1E2B] hover:opacity-90"
            }`}
          >
            {saved ? "✓ Rates Updated Successfully!" : "Save Exchange Rates"}
          </motion.button>
        </div>

        {/* 2FA Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !processing && setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1E1E2B] border-2 border-[#641AE4] rounded-2xl p-8 max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#641AE4]/20 mb-4">
                    <Shield className="w-8 h-8 text-[#641AE4]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Confirm Global Rate Change</h3>
                  <p className="text-[#B0B0B8]">This action requires 2FA authentication</p>
                </div>

                {/* Warning */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-400 font-medium mb-1">Critical Action</p>
                      <p className="text-xs text-[#B0B0B8]">
                        Global rates affect auto-payout calculations for all settled trades. Ensure accuracy before confirming.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rate Summary */}
                <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">USDT/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(exchangeRates.usdtNgn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">USDC/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(exchangeRates.usdcNgn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">BTC/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(exchangeRates.btcNgn).toLocaleString()}</span>
                  </div>
                </div>

                {/* 2FA Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-2">2FA Authentication Code</label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value)
                      setTwoFactorError("")
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={`w-full bg-[#2D2D3D] border-b-2 ${
                      twoFactorError ? "border-b-red-500" : "border-b-transparent focus:border-b-[#C8F55A]"
                    } text-[#F0F0F0] text-center text-2xl font-mono tracking-widest px-4 py-3 rounded transition-all focus:outline-none`}
                  />
                  {twoFactorError ? (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 mt-2 text-center"
                    >
                      {twoFactorError}
                    </motion.p>
                  ) : (
                    <p className="text-xs text-[#B0B0B8] mt-2 text-center">Demo code: 123456</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmModal(false)}
                    disabled={processing}
                    className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmSave}
                    disabled={processing || twoFactorCode.length !== 6}
                    className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Updating..." : "Confirm Changes"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Settings */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Platform Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#2D2D3D] rounded-lg">
              <span className="text-[#B0B0B8]">Two-Factor Authentication</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2D2D3D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#641AE4]" />
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2D2D3D] rounded-lg">
              <span className="text-[#B0B0B8]">Email Verification</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2D2D3D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#641AE4]" />
              </label>
            </div>
          </div>
        </div>

        {/* Logout Button - Visible on Mobile */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sessionStorage.clear()
            localStorage.clear()
            router.push("/auth/login")
          }}
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
