"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut, CheckCircle, Loader2, User, Bell, Shield, CreditCard, ChevronRight, Lock, Zap } from "lucide-react"
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
  useToggleTwoFactor,
  useAutoPayoutStatus,
  useToggleAutoPayout,
  useBanks,
} from "@/lib/hooks/use-user-settings"

type TabType = "account" | "bank" | "notifications" | "security"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("account")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"phone_number" | "bank_account" | null>(null)
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("")
  const logoutMutation = useLogout()

  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: notificationPrefs } = useNotificationPreferences()
  const { data: bankAccountData } = useBankAccount()
  const { data: banksData, isLoading: banksLoading } = useBanks()

  const updateProfileMutation = useUpdateProfile()
  const updateNotificationsMutation = useUpdateNotificationPreferences()
  const updateBankMutation = useUpdateBankAccount()
  const verifyBankMutation = useVerifyBankAccount()
  const toggleTwoFactorMutation = useToggleTwoFactor()
  const { data: autoPayoutData } = useAutoPayoutStatus()
  const toggleAutoPayoutMutation = useToggleAutoPayout()

  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "" })
  const [bankDetails, setBankDetails] = useState({ bankCode: "", bankName: "", accountNumber: "", accountName: "" })
  const [isVerified, setIsVerified] = useState(false)

  const twoFactorEnabled = profile?.twoFactorEnabled || false

  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName || "", phoneNumber: profile.phoneNumber || "" })
      setOriginalPhoneNumber(profile.phoneNumber || "")
    }
  }, [profile])

  useEffect(() => {
    if (bankAccountData) {
      setBankDetails({ bankCode: bankAccountData.bankCode || "", bankName: bankAccountData.bankName || "", accountNumber: bankAccountData.accountNumber || "", accountName: bankAccountData.accountName || "" })
      setIsVerified(bankAccountData.isVerified || false)
    }
  }, [bankAccountData])

  const handleLogout = () => logoutMutation.mutate()
  const isKycVerified = profile?.kycStatus === "Verified"

  // Check if phone number changed
  const phoneNumberChanged = profileForm.phoneNumber !== originalPhoneNumber

  const handleSaveProfile = () => {
    // If 2FA enabled and phone number changed, require OTP
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
    // If 2FA enabled, require OTP
    if (twoFactorEnabled) {
      setPendingAction("bank_account")
      setShowOtpModal(true)
      return
    }
    performBankSave()
  }

  const performBankSave = () => {
    updateBankMutation.mutate({
      bankCode: bankDetails.bankCode, bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber, accountName: bankDetails.accountName,
    }, {
      onSuccess: () => toast.success("Bank account saved! 🏦", { description: "Your payout account has been updated." }),
      onError: () => toast.error("Failed to save bank account", { description: "Please try again later." }),
    })
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    if (pendingAction === "phone_number") {
      performProfileSave()
    } else if (pendingAction === "bank_account") {
      performBankSave()
    }
    setPendingAction(null)
  }

  const handleToggleNotification = (key: string, value: boolean) => {
    updateNotificationsMutation.mutate({ [key]: value }, { onSuccess: () => toast.success(value ? "Notifications enabled" : "Notifications disabled") })
  }

  const handleToggleTwoFactor = (enabled: boolean) => {
    toggleTwoFactorMutation.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? "2FA enabled! 🔐" : "2FA disabled", { description: enabled ? "Your account is now more secure." : "Two-factor authentication has been turned off." }),
    })
  }

  const tabs = [
    { id: "account" as TabType, label: "Account", icon: User },
    { id: "bank" as TabType, label: "Bank Account", icon: CreditCard },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ]

  if (profileLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Settings" subtitle="Manage your account preferences and security" />
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
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Personal Information</h2>
                  <div className="space-y-5">
                    <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Full Name</label><input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email Address</label><input type="email" value={profile?.email || ""} disabled className="w-full bg-[#2D2D3D]/50 text-[#B0B0B8] px-4 py-3 rounded cursor-not-allowed" /></div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Phone Number</label>
                      <input type="tel" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none" />
                      {twoFactorEnabled && phoneNumberChanged && (
                        <p className="text-xs text-[#641AE4] mt-2">🔐 OTP verification required to change phone number</p>
                      )}
                    </div>
                  </div>
                  <motion.button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50">{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</motion.button>
                </div>
                <div className={`p-6 rounded-xl ${isKycVerified ? "bg-gradient-to-br from-[#C8F55A]/10 to-[#C8F55A]/5 border border-[#C8F55A]/30" : "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isKycVerified ? "bg-[#C8F55A]/20" : "bg-amber-500/20"}`}><CheckCircle className={`w-6 h-6 ${isKycVerified ? "text-[#C8F55A]" : "text-amber-500"}`} /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-[#F0F0F0] mb-1">{isKycVerified ? "KYC Verified" : "KYC Pending"}</h3><p className="text-sm text-[#B0B0B8] mb-3">{isKycVerified ? "Your account is fully verified. You can trade without limits." : "Complete your KYC verification to unlock all features."}</p><div className="text-xs text-[#B0B0B8]">Status: {profile?.kycStatus}</div></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                <div className="mb-4"><h2 className="text-lg font-semibold text-[#F0F0F0]">Naira Payout Account</h2><p className="text-sm text-[#B0B0B8] mt-1">Link your bank account to receive Naira payments</p></div>
                {twoFactorEnabled && (
                  <div className="mb-4 p-3 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg">
                    <p className="text-sm text-[#D1D1D6]"><span className="text-[#D8B4FE] font-bold">🔐 2FA Enabled:</span> OTP verification required to save bank account changes.</p>
                  </div>
                )}
                <div className="space-y-5 mt-6">
                  <div><label className="block text-sm font-medium text-[#F0F0F0] mb-2">Select Bank</label>
                    <BankSelector
                      banks={banksData}
                      isLoading={banksLoading}
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
                <div className={`mt-6 p-5 border rounded-xl ${isKycVerified ? "bg-[#C8F55A]/5 border-[#C8F55A]/30" : "bg-[#1E1E2B]/80 border-[#2D2D3D]"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isKycVerified ? "bg-[#C8F55A]/20" : "bg-[#2D2D3D]"}`}>{isKycVerified ? <Zap className="w-6 h-6 text-[#C8F55A]" /> : <Lock className="w-6 h-6 text-[#B0B0B8]" />}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-[#F0F0F0]">Auto Payout</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${autoPayoutData?.autoPayoutEnabled ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-amber-500/20 text-amber-400"}`}>{autoPayoutData?.autoPayoutEnabled ? "Enabled" : "Disabled"}</span>
                        </div>
                        {isKycVerified && (
                          <motion.button 
                            onClick={() => toggleAutoPayoutMutation.mutate(!autoPayoutData?.autoPayoutEnabled, {
                              onSuccess: () => toast.success(autoPayoutData?.autoPayoutEnabled ? "Auto payout disabled" : "Auto payout enabled! 🚀", { description: autoPayoutData?.autoPayoutEnabled ? "You will need to manually request payouts." : "Payouts will be processed automatically when trades settle." })
                            })} 
                            disabled={toggleAutoPayoutMutation.isPending} 
                            className={`relative w-14 h-8 rounded-full transition-all ${autoPayoutData?.autoPayoutEnabled ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"}`}
                          >
                            <motion.div animate={{ x: autoPayoutData?.autoPayoutEnabled ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg" />
                          </motion.button>
                        )}
                      </div>
                      <p className="text-sm text-[#B0B0B8]">{isKycVerified ? (autoPayoutData?.autoPayoutEnabled ? "Payouts are processed automatically when trades are settled." : "Enable to automatically receive payouts when trades settle.") : "Complete KYC verification to unlock automatic payouts."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Notification Preferences</h2>
                <p className="text-sm text-[#B0B0B8] mb-6">Choose how you want to receive updates about your trades</p>
                <div className="space-y-4">
                  {[{ key: "emailNotifications", label: "Email Notifications", desc: "Receive trade updates via email" }, { key: "smsNotifications", label: "SMS Notifications", desc: "Get instant SMS alerts" }, { key: "tradeAlerts", label: "Trade Status Alerts", desc: "Notifications when trade status changes" }].map((item) => (
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
                    <div className="flex-1 pr-4"><p className="font-medium text-[#F0F0F0]">Two-Factor Authentication</p><p className="text-sm text-[#B0B0B8] mt-1">Add an extra layer of security to your account</p></div>
                    <motion.button onClick={() => handleToggleTwoFactor(!profile?.twoFactorEnabled)} disabled={toggleTwoFactorMutation.isPending} className={`relative w-14 h-8 rounded-full transition-all ${profile?.twoFactorEnabled ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"}`}>
                      <motion.div animate={{ x: profile?.twoFactorEnabled ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg" />
                    </motion.button>
                  </motion.div>
                  {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg">
                      <p className="text-sm text-[#C8F55A] font-medium mb-2">🔐 Protected Actions</p>
                      <p className="text-xs text-[#B0B0B8]">With 2FA enabled, the following changes require email OTP verification:</p>
                      <ul className="text-xs text-[#B0B0B8] mt-2 space-y-1">
                        <li>• Password changes</li>
                        <li>• Bank account updates</li>
                        <li>• Phone number changes</li>
                      </ul>
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

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => { setShowOtpModal(false); setPendingAction(null) }}
        onVerified={handleOtpVerified}
        title={pendingAction === "phone_number" ? "Verify Phone Change" : "Verify Bank Account Change"}
        description="For your security, please verify this action"
        email={profile?.email || ""}
        actionType={pendingAction || "bank_account"}
      />
    </motion.div>
  )
}
