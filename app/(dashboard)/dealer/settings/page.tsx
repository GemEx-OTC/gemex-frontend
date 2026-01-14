"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut, CheckCircle, Loader2, User, Bell, Shield, CreditCard, ChevronRight, TrendingUp, Info, AlertTriangle } from "lucide-react"
import { BankSelector } from "@/components/bank-selector"
import { toast } from "sonner"
import { useLogout } from "@/lib/hooks/use-auth"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { OtpVerificationModal } from "@/components/settings/otp-verification-modal"
import {
  useProfile,
  useUpdateProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useBankAccount,
  useUpdateBankAccount,
  useVerifyBankAccount,
  useDealerRates,
  useUpdateDealerRates,
  useToggleTwoFactor,
} from "@/lib/hooks/use-user-settings"

type TabType = "account" | "rates" | "bank" | "notifications" | "security"
type PendingActionType = "phone_number" | "bank_account" | "quote_rates" | null

export default function DealerSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("account")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingActionType>(null)
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("")
  const logoutMutation = useLogout()

  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: notificationPrefs } = useNotificationPreferences()
  const { data: bankAccountData } = useBankAccount()
  const { data: dealerRatesData, isLoading: ratesLoading } = useDealerRates()

  const updateProfileMutation = useUpdateProfile()
  const updateNotificationsMutation = useUpdateNotificationPreferences()
  const updateBankMutation = useUpdateBankAccount()
  const verifyBankMutation = useVerifyBankAccount()
  const updateRatesMutation = useUpdateDealerRates()
  const toggleTwoFactorMutation = useToggleTwoFactor()

  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "" })
  const [dealerRates, setDealerRates] = useState({ usdtNgn: "", usdcNgn: "", btcNgn: "" })
  const [bankDetails, setBankDetails] = useState({ bankCode: "", bankName: "", accountNumber: "", accountName: "" })
  const [isVerified, setIsVerified] = useState(false)

  const twoFactorEnabled = profile?.twoFactorEnabled || false
  const phoneNumberChanged = profileForm.phoneNumber !== originalPhoneNumber

  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName || "", phoneNumber: profile.phoneNumber || "" })
      setOriginalPhoneNumber(profile.phoneNumber || "")
    }
  }, [profile])

  useEffect(() => {
    if (dealerRatesData) {
      setDealerRates({
        usdtNgn: dealerRatesData.USDT_NGN?.toString() || "1560",
        usdcNgn: dealerRatesData.USDC_NGN?.toString() || "1558",
        btcNgn: dealerRatesData.BTC_NGN?.toString() || "143000000",
      })
    }
  }, [dealerRatesData])

  useEffect(() => {
    if (bankAccountData) {
      setBankDetails({
        bankCode: bankAccountData.bankCode || "",
        bankName: bankAccountData.bankName || "",
        accountNumber: bankAccountData.accountNumber || "",
        accountName: bankAccountData.accountName || "",
      })
      setIsVerified(bankAccountData.isVerified || false)
    }
  }, [bankAccountData])

  const handleLogout = () => logoutMutation.mutate()

  const handleSaveProfile = () => {
    if (twoFactorEnabled && phoneNumberChanged) {
      setPendingAction("phone_number")
      setShowOtpModal(true)
      return
    }
    performProfileSave()
  }

  const performProfileSave = () => {
    updateProfileMutation.mutate(profileForm, {
      onSuccess: () => {
        toast.success("Profile updated!", { description: "Your profile information has been saved." })
        setOriginalPhoneNumber(profileForm.phoneNumber)
      },
      onError: () => toast.error("Failed to update profile", { description: "Please try again later." }),
    })
  }

  const handleAccountNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10)
    setBankDetails((prev) => ({ ...prev, accountNumber: cleaned, accountName: "" }))
    setIsVerified(false)
    if (cleaned.length === 10 && bankDetails.bankCode) {
      verifyBankMutation.mutate({ bankCode: bankDetails.bankCode, accountNumber: cleaned }, {
        onSuccess: (data) => { setBankDetails((prev) => ({ ...prev, accountName: data.accountName })); setIsVerified(true) },
        onError: () => toast.error("Verification failed", { description: "Could not verify account. Please check the details." }),
      })
    }
  }

  const handleSaveBankAccount = () => {
    if (!isVerified) return
    if (twoFactorEnabled) {
      setPendingAction("bank_account")
      setShowOtpModal(true)
      return
    }
    performBankSave()
  }

  const performBankSave = () => {
    updateBankMutation.mutate({
      bankCode: bankDetails.bankCode,
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
    }, {
      onSuccess: () => toast.success("Bank account saved! 🏦", { description: "Your payout account has been updated." }),
      onError: () => toast.error("Failed to save bank account", { description: "Please try again later." }),
    })
  }

  const handleSaveRates = () => {
    if (twoFactorEnabled) {
      setPendingAction("quote_rates")
      setShowOtpModal(true)
      return
    }
    performRatesSave()
  }

  const performRatesSave = () => {
    updateRatesMutation.mutate({
      USDT_NGN: Number(dealerRates.usdtNgn),
      USDC_NGN: Number(dealerRates.usdcNgn),
      BTC_NGN: Number(dealerRates.btcNgn),
    }, {
      onSuccess: () => toast.success("Rates updated! 📈", { description: "Your new quote rates are now active." }),
      onError: () => toast.error("Failed to update rates", { description: "Please try again later." }),
    })
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    if (pendingAction === "phone_number") performProfileSave()
    else if (pendingAction === "bank_account") performBankSave()
    else if (pendingAction === "quote_rates") performRatesSave()
    setPendingAction(null)
  }

  const handleToggleNotification = (key: string, value: boolean) => {
    updateNotificationsMutation.mutate({ [key]: value }, {
      onSuccess: () => toast.success(value ? "Notifications enabled" : "Notifications disabled"),
    })
  }

  const handleToggleTwoFactor = (enabled: boolean) => {
    toggleTwoFactorMutation.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? "2FA enabled! 🔐" : "2FA disabled", { description: enabled ? "Your account is now more secure." : "Two-factor authentication has been turned off." }),
    })
  }

  const tabs = [
    { id: "account" as TabType, label: "Account", icon: User },
    { id: "rates" as TabType, label: "Quote Rates", icon: TrendingUp },
    { id: "bank" as TabType, label: "Bank Account", icon: CreditCard },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ]

  if (profileLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Dealer Settings" subtitle="Manage your rates, account preferences and security" />
      <div className="max-w-5xl">
        <div className="mb-8">
          <div className="hidden md:flex gap-2 p-1 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg">
            {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id
              return (<motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isActive ? "bg-[#641AE4] text-[#F0F0F0] shadow-lg shadow-[#641AE4]/20" : "text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]"}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></motion.button>)
            })}
          </div>
          <div className="md:hidden space-y-2">
            {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id
              return (<motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.98 }} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isActive ? "bg-[#641AE4]/20 border-2 border-[#641AE4] text-[#F0F0F0]" : "bg-[#1E1E2B]/60 border border-[#2D2D3D] text-[#B0B0B8]"}`}><div className="flex items-center gap-3"><Icon className="w-5 h-5" /><span>{tab.label}</span></div><ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "rotate-90" : ""}`} /></motion.button>)
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Dealer Profile</h2>
                  <div className="space-y-5">
                    <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Full Name</label><input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email Address</label><input type="email" value={profile?.email || ""} disabled className="w-full bg-[#2D2D3D]/50 text-[#B0B0B8] px-4 py-3 rounded cursor-not-allowed" /></div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Phone Number</label>
                      <input type="tel" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none" />
                      {twoFactorEnabled && phoneNumberChanged && <p className="text-xs text-[#641AE4] mt-2">🔐 OTP verification required to change phone number</p>}
                    </div>
                  </div>
                  <motion.button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50">{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</motion.button>
                </div>
                <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-6 h-6 text-[#641AE4]" /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-[#F0F0F0] mb-1">Active Dealer</h3><p className="text-sm text-[#B0B0B8] mb-3">You are authorized to generate firm quotes and manage client trades.</p><div className="text-xs text-[#B0B0B8]">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</div></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rates" && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                  <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-semibold text-[#F0F0F0]">Bulk Quote Rates</h2><p className="text-sm text-[#B0B0B8] mt-1">Set your rates for client bulk trade quotes</p></div></div>
                  {twoFactorEnabled && <div className="mb-4 p-3 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg"><p className="text-xs text-[#B0B0B8]"><span className="text-[#641AE4] font-medium">🔐 2FA Enabled:</span> OTP verification required to update quote rates.</p></div>}
                  {ratesLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
                    <div className="space-y-5 mt-6">
                      <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDT to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={dealerRates.usdtNgn} onChange={(e) => setDealerRates({ ...dealerRates, usdtNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
                      <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDC to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={dealerRates.usdcNgn} onChange={(e) => setDealerRates({ ...dealerRates, usdcNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
                      <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">BTC to NGN Rate</label><div className="flex items-center gap-2"><input type="text" value={dealerRates.btcNgn} onChange={(e) => setDealerRates({ ...dealerRates, btcNgn: e.target.value })} className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono" /><span className="text-[#B0B0B8]">NGN</span></div></div>
                    </div>
                  )}
                  <motion.button onClick={handleSaveRates} disabled={updateRatesMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50">{updateRatesMutation.isPending ? "Saving..." : "Save Quote Rates"}</motion.button>
                </div>
                <div className="p-5 bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl"><div className="flex items-start gap-3"><Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" /><div><h4 className="font-medium text-[#F0F0F0] mb-2">How Dealer Rates Work</h4><ul className="text-sm text-[#B0B0B8] space-y-2"><li>• <strong className="text-[#F0F0F0]">Your rates</strong> are used when generating firm quotes for client bulk trades</li><li>• <strong className="text-[#F0F0F0]">Admin global rates</strong> are used for auto-payout calculations</li></ul></div></div></div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                <div className="mb-4"><h2 className="text-lg font-semibold text-[#F0F0F0]">Payout Account</h2><p className="text-sm text-[#B0B0B8] mt-1">Link your bank account for commission payouts</p></div>
                {twoFactorEnabled && <div className="mb-4 p-3 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg"><p className="text-xs text-[#B0B0B8]"><span className="text-[#641AE4] font-medium">🔐 2FA Enabled:</span> OTP verification required to save bank account changes.</p></div>}
                <div className="space-y-5 mt-6">
                  <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">Select Bank</label>
                    <BankSelector
                      value={bankDetails.bankCode}
                      onChange={(code, name) => {
                        setBankDetails((p) => ({ ...p, bankCode: code, bankName: name, accountName: "" }))
                        setIsVerified(false)
                        if (bankDetails.accountNumber.length === 10 && code) {
                          verifyBankMutation.mutate(
                            { bankCode: code, accountNumber: bankDetails.accountNumber },
                            { onSuccess: (d) => { setBankDetails((p) => ({ ...p, accountName: d.accountName })); setIsVerified(true) } }
                          )
                        }
                      }}
                    />
                  </div>
                  <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">Account Number</label>
                    <div className="relative"><input type="text" value={bankDetails.accountNumber} onChange={(e) => handleAccountNumberChange(e.target.value)} placeholder="Enter 10-digit account number" maxLength={10} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 pr-12 rounded transition-all focus:outline-none font-mono" />{verifyBankMutation.isPending && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 text-[#C8F55A] animate-spin" /></div>}</div></div>
                  <AnimatePresence>
                    {isVerified && bankDetails.accountName && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg"><div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-[#C8F55A]" /><div><p className="text-sm text-[#B0B0B8]">Account Name</p><p className="font-semibold text-[#F0F0F0]">{bankDetails.accountName}</p></div></div></motion.div>}
                  </AnimatePresence>
                  {isVerified && <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleSaveBankAccount} disabled={updateBankMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50">{updateBankMutation.isPending ? "Saving..." : "Save Bank Account"}</motion.button>}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Notification Preferences</h2>
                <p className="text-sm text-[#B0B0B8] mb-6">Choose how you want to receive updates</p>
                <div className="space-y-4">
                  {[{ key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" }, { key: "smsNotifications", label: "SMS Notifications", desc: "Get instant SMS alerts" }, { key: "tradeAlerts", label: "Trade Alerts", desc: "Notifications when trade status changes" }].map((item) => (
                    <motion.div key={item.key} whileHover={{ scale: 1.01 }} className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg">
                      <div className="flex-1 pr-4"><p className="font-medium text-[#F0F0F0]">{item.label}</p><p className="text-sm text-[#B0B0B8] mt-1">{item.desc}</p></div>
                      <motion.button onClick={() => handleToggleNotification(item.key, !(notificationPrefs as any)?.[item.key])} disabled={updateNotificationsMutation.isPending} className={`relative w-14 h-8 rounded-full transition-all ${(notificationPrefs as any)?.[item.key] ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"}`}>
                        <motion.div animate={{ x: (notificationPrefs as any)?.[item.key] ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Security Settings</h2>
                  <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg">
                    <div className="flex-1 pr-4"><p className="font-medium text-[#F0F0F0]">Two-Factor Authentication</p><p className="text-sm text-[#B0B0B8] mt-1">Add an extra layer of security</p></div>
                    <motion.button onClick={() => handleToggleTwoFactor(!profile?.twoFactorEnabled)} disabled={toggleTwoFactorMutation.isPending} className={`relative w-14 h-8 rounded-full transition-all ${profile?.twoFactorEnabled ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"}`}>
                      <motion.div animate={{ x: profile?.twoFactorEnabled ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg" />
                    </motion.button>
                  </motion.div>
                  {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg">
                      <p className="text-sm text-[#C8F55A] font-medium mb-2">🔐 Protected Actions</p>
                      <p className="text-xs text-[#B0B0B8]">With 2FA enabled, the following changes require email OTP verification:</p>
                      <ul className="text-xs text-[#B0B0B8] mt-2 space-y-1"><li>• Password changes</li><li>• Bank account updates</li><li>• Phone number changes</li><li>• Quote rate updates</li></ul>
                    </div>
                  )}
                </div>
                <ChangePasswordForm />
              </div>
            )}
          </motion.div>

          <motion.button onClick={handleLogout} disabled={logoutMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="my-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50">
            <LogOut className="w-5 h-5" /><span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </motion.button>
        </AnimatePresence>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => { setShowOtpModal(false); setPendingAction(null) }}
        onVerified={handleOtpVerified}
        title={pendingAction === "phone_number" ? "Verify Phone Change" : pendingAction === "bank_account" ? "Verify Bank Account Change" : "Verify Rate Update"}
        description="For your security, please verify this action"
        email={profile?.email || ""}
        actionType={pendingAction || "quote_rates"}
      />
    </motion.div>
  )
}
