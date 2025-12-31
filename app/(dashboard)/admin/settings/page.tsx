"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { Shield, LogOut, Loader2, TrendingUp, User } from "lucide-react"
import { toast } from "sonner"
import { useLogout } from "@/lib/hooks/use-auth"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { OtpVerificationModal } from "@/components/settings/otp-verification-modal"
import {
  useProfile,
  useUpdateProfile,
  useGlobalExchangeRates,
  useUpdateGlobalExchangeRates,
  useToggleTwoFactor,
} from "@/lib/hooks/use-user-settings"

export default function AdminSettingsPage() {
  const [showOtpModal, setShowOtpModal] = useState(false)
  const logoutMutation = useLogout()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: exchangeRatesData, isLoading: ratesLoading } = useGlobalExchangeRates()

  const updateProfileMutation = useUpdateProfile()
  const updateRatesMutation = useUpdateGlobalExchangeRates()
  const toggleTwoFactorMutation = useToggleTwoFactor()

  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "" })
  const [exchangeRates, setExchangeRates] = useState({ btcNgn: "", usdtNgn: "", usdcNgn: "", btcUsd: "", usdNgn: "" })

  const twoFactorEnabled = profile?.twoFactorEnabled || false

  useEffect(() => {
    if (profile) setProfileForm({ fullName: profile.fullName || "", phoneNumber: profile.phoneNumber || "" })
  }, [profile])

  useEffect(() => {
    if (exchangeRatesData) {
      setExchangeRates({
        usdtNgn: exchangeRatesData.USDT_NGN?.toString() || "1565",
        usdcNgn: exchangeRatesData.USDC_NGN?.toString() || "1565",
        btcUsd: exchangeRatesData.BTC_USD?.toString() || "94000",
        usdNgn: exchangeRatesData.USD_NGN?.toString() || "1550",
        btcNgn: exchangeRatesData.BTC_NGN?.toString() || "145700000",
      })
    }
  }, [exchangeRatesData])

  const handleLogout = () => logoutMutation.mutate()

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm, {
      onSuccess: () => toast.success("Profile updated!", { description: "Your profile information has been saved." }),
      onError: () => toast.error("Failed to update profile"),
    })
  }

  const handleSaveRates = () => {
    // Admin always requires OTP for exchange rate changes (critical action)
    if (twoFactorEnabled) {
      setShowOtpModal(true)
      return
    }
    performRatesSave()
  }

  const performRatesSave = () => {
    updateRatesMutation.mutate({
      USDT_NGN: Number(exchangeRates.usdtNgn),
      USDC_NGN: Number(exchangeRates.usdcNgn),
      BTC_USD: Number(exchangeRates.btcUsd),
      USD_NGN: Number(exchangeRates.usdNgn),
      BTC_NGN: Number(exchangeRates.btcNgn),
    }, {
      onSuccess: () => toast.success("Exchange rates updated! 📈", { description: "Global rates are now active for all calculations." }),
      onError: () => toast.error("Failed to update rates", { description: "Please try again later." }),
    })
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    performRatesSave()
  }

  const handleToggleTwoFactor = (enabled: boolean) => {
    toggleTwoFactorMutation.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? "2FA enabled! 🔐" : "2FA disabled"),
    })
  }

  if (profileLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="System Settings" subtitle="Configure exchange rates and platform parameters" />

      <div className="max-w-3xl space-y-6">
        {/* Admin Profile */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#641AE4]/20 flex items-center justify-center"><User className="w-5 h-5 text-[#641AE4]" /></div>
            <div><h2 className="text-lg font-semibold text-[#F0F0F0]">Admin Profile</h2><p className="text-sm text-[#B0B0B8]">Your account information</p></div>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Full Name</label><input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email</label><input type="email" value={profile?.email || ""} disabled className="w-full bg-[#2D2D3D]/50 text-[#B0B0B8] px-4 py-3 rounded cursor-not-allowed" /></div>
          </div>
          <motion.button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50">{updateProfileMutation.isPending ? "Saving..." : "Save Profile"}</motion.button>
        </div>

        {/* Exchange Rates */}
        <div className="p-8 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#641AE4]/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-[#641AE4]" /></div>
            <div><h2 className="text-xl font-bold text-[#F0F0F0]">Global Exchange Rates</h2><p className="text-sm text-[#B0B0B8]">Used for auto-payout calculations on settled trades</p></div>
          </div>
          {twoFactorEnabled && <div className="mb-4 p-3 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg"><p className="text-xs text-[#B0B0B8]"><span className="text-[#641AE4] font-medium">🔐 2FA Enabled:</span> OTP verification required to update global exchange rates.</p></div>}
          {ratesLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDT to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={exchangeRates.usdtNgn} onChange={(e) => setExchangeRates({ ...exchangeRates, usdtNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
              <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDC to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={exchangeRates.usdcNgn} onChange={(e) => setExchangeRates({ ...exchangeRates, usdcNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
              <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">BTC to USD Rate</label><div className="flex items-center gap-2"><input type="text" value={exchangeRates.btcUsd} onChange={(e) => setExchangeRates({ ...exchangeRates, btcUsd: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">USD</span></div></div>
              <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">USD to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={exchangeRates.usdNgn} onChange={(e) => setExchangeRates({ ...exchangeRates, usdNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
              <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">BTC to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={exchangeRates.btcNgn} onChange={(e) => setExchangeRates({ ...exchangeRates, btcNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
            </div>
          )}
          <div className="mt-6 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/20 rounded-lg"><p className="text-[#C8F55A] text-sm font-medium">⚠️ Rate changes take effect immediately and affect all new quotes</p></div>
          <motion.button onClick={handleSaveRates} disabled={updateRatesMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50">{updateRatesMutation.isPending ? "Saving..." : "Save Exchange Rates"}</motion.button>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#641AE4]/20 flex items-center justify-center"><Shield className="w-5 h-5 text-[#641AE4]" /></div>
            <div><h2 className="text-lg font-semibold text-[#F0F0F0]">Security Settings</h2><p className="text-sm text-[#B0B0B8]">Manage your account security</p></div>
          </div>
          <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg">
            <div className="flex-1 pr-4"><p className="font-medium text-[#F0F0F0]">Two-Factor Authentication</p><p className="text-sm text-[#B0B0B8] mt-1">Add an extra layer of security to your admin account</p></div>
            <motion.button onClick={() => handleToggleTwoFactor(!profile?.twoFactorEnabled)} disabled={toggleTwoFactorMutation.isPending} className={`relative w-14 h-8 rounded-full transition-all ${profile?.twoFactorEnabled ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"}`}>
              <motion.div animate={{ x: profile?.twoFactorEnabled ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg" />
            </motion.button>
          </motion.div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg">
              <p className="text-sm text-[#C8F55A] font-medium mb-2">🔐 Protected Actions</p>
              <p className="text-xs text-[#B0B0B8]">With 2FA enabled, the following changes require email OTP verification:</p>
              <ul className="text-xs text-[#B0B0B8] mt-2 space-y-1"><li>• Password changes</li><li>• Global exchange rate updates</li></ul>
            </div>
          )}
        </div>

        {/* Change Password */}
        <ChangePasswordForm />

        {/* Logout */}
        <motion.button onClick={handleLogout} disabled={logoutMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50">
          <LogOut className="w-5 h-5" /><span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
        </motion.button>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        title="Verify Exchange Rate Update"
        description="This is a critical action that affects all platform calculations"
        email={profile?.email || ""}
        actionType="exchange_rates"
      />
    </motion.div>
  )
}
