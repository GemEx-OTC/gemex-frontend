"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut, CheckCircle, Loader2, User, Bell, Shield, CreditCard, ChevronRight, Lock, Zap, X } from "lucide-react"
import { BankSelector } from "@/components/bank-selector"
import { toast } from "sonner"
import { useLogout } from "@/lib/hooks/use-auth"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { OtpVerificationModal } from "@/components/otp-verification-modal"
import { BusinessVerificationModal } from "@/components/business-verification-modal"
import {
  useUserSettingsProfile,
  useUpdateUserSettingsProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useBankAccount,
  useUpdateBankAccount,
  useVerifyBankAccount,
  useToggleTwoFactor,
  useAutoPayoutStatus,
  useToggleAutoPayout,
  useBanks,
  useSendPhoneOtp,
  useVerifyPhoneOtp,
  useVerifyIdentity,
  useVerifyCac
} from "@/lib/hooks/use-user-settings"

type TabType = "account" | "bank" | "notifications" | "security"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("account")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"phone_number" | "bank_account" | "phone_verification" | null>(null)
  const [showIdModal, setShowIdModal] = useState(false)
  const [showCacModal, setShowCacModal] = useState(false)
  const [idType, setIdType] = useState<"nin" | "drivers_license" | "passport">("nin")
  const [idValue, setIdValue] = useState("")
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState("")
  const [otpPreSent, setOtpPreSent] = useState(false)
  const logoutMutation = useLogout()

  const { data: profile, isLoading: profileLoading } = useUserSettingsProfile()
  const { data: notificationPrefs } = useNotificationPreferences()
  const { data: bankAccountData } = useBankAccount()
  const { data: banksData, isLoading: banksLoading } = useBanks()

  const updateProfileMutation = useUpdateUserSettingsProfile()
  const updateNotificationsMutation = useUpdateNotificationPreferences()
  const updateBankMutation = useUpdateBankAccount()
  const verifyBankMutation = useVerifyBankAccount()
  const toggleTwoFactorMutation = useToggleTwoFactor()
  const { data: autoPayoutData } = useAutoPayoutStatus()
  const toggleAutoPayoutMutation = useToggleAutoPayout()
  
  const sendPhoneOtpMutation = useSendPhoneOtp()
  const verifyPhoneOtpMutation = useVerifyPhoneOtp()
  const verifyIdentityMutation = useVerifyIdentity()
  const verifyCacMutation = useVerifyCac()

  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "" })
  const [bankDetails, setBankDetails] = useState({ bankCode: "", bankName: "", accountNumber: "", accountName: "" })
  const [isVerified, setIsVerified] = useState(false)
  const [isEditingBank, setIsEditingBank] = useState(false)

  const twoFactorEnabled = profile?.twoFactorEnabled || false
  const hasSavedBank = !!bankAccountData?.accountNumber && bankAccountData?.isVerified

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
  const userTier = profile?.tier || 1
  const phoneVerified = profile?.phoneVerified || false
  const ninVerified = profile?.ninVerified || false
  const cacVerified = profile?.cacVerified || false

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

    if (!phoneVerified) {
      setPendingAction("phone_verification")
      setShowOtpModal(true)
      return
    }

    if (twoFactorEnabled) {
      setPendingAction("bank_account")
      setShowOtpModal(true)
      return
    }

    performBankSave()
  }

  const handleVerifyPhone = () => {
    if (!profileForm.phoneNumber) {
      toast.error("Phone number missing", { description: "Please enter your phone number first." })
      return
    }
    sendPhoneOtpMutation.mutate(profileForm.phoneNumber, {
      onSuccess: () => {
        setOtpPreSent(true)
        setPendingAction("phone_verification")
        setShowOtpModal(true)
      },
      onError: (err: any) => toast.error("Failed to send OTP", { description: err.message })
    })
  }

  const handleVerifyIdentity = () => {
    if (!idValue) {
      toast.error("Required field", { description: "Please enter your ID number." })
      return
    }
    verifyIdentityMutation.mutate({ idType, idNumber: idValue }, {
      onSuccess: () => {
        toast.success("Identity Verified!", { description: "You have been upgraded to Tier 2." })
        setShowIdModal(false)
        setIdValue("")
      },
      onError: (err: any) => toast.error("Verification failed", { description: err.message })
    })
  }
  const performBankSave = () => {
    updateBankMutation.mutate({
      bankCode: bankDetails.bankCode, bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber, accountName: bankDetails.accountName,
    }, {
      onSuccess: () => {
        toast.success("Bank account saved! 🏦", { description: "Your payout account has been updated." })
        setIsEditingBank(false)
      },
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

  const handlePhoneOtpVerified = (otp: string) => {
    setShowOtpModal(false)
    setPendingAction(null)
    setOtpPreSent(false)
    setActiveTab("bank") // Switch back if we were verifying for bank

    // If the user was trying to save their bank account but needed phone
    // verification first, now go ahead and save it.
    if (bankDetails.bankCode && bankDetails.accountNumber && bankDetails.accountName && isVerified) {
      performBankSave()
    }
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
                      <div className="relative">
                        <input 
                          type="tel" 
                          value={profileForm.phoneNumber} 
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} 
                          disabled={!originalPhoneNumber}
                          className={`w-full ${!originalPhoneNumber ? "bg-[#2D2D3D]/50 text-[#B0B0B8] cursor-not-allowed" : "bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0]"} px-4 py-3 rounded transition-all focus:outline-none`} 
                        />
                        {!originalPhoneNumber && (
                          <p className="text-[10px] text-[#641AE4] mt-1 italic">Verify phone number via Bank Account setup</p>
                        )}
                      </div>
                      {twoFactorEnabled && phoneNumberChanged && (
                        <p className="text-xs text-[#641AE4] mt-2">🔐 OTP verification required to change phone number</p>
                      )}
                    </div>
                  </div>
                  <motion.button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50">{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</motion.button>
                </div>

                {/* Tier Status Section */}
                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="px-3 py-1 bg-[#641AE4] text-white text-xs font-bold rounded-full shadow-lg">
                      TIER {userTier}
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Verification Tiers</h2>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Tier 1 */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${userTier >= 1 ? "border-[#C8F55A]/50 bg-[#C8F55A]/5" : "border-[#2D2D3D] opacity-60"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#C8F55A]">TIER 1</span>
                        {phoneVerified ? <CheckCircle className="w-4 h-4 text-[#C8F55A]" /> : <div className="w-4 h-4 rounded-full border border-[#B0B0B8]" />}
                      </div>
                      <h4 className="font-semibold text-[#F0F0F0] mb-1">Phone Verified</h4>
                      <p className="text-xs text-[#B0B0B8] mb-3">Limit: ₦100,000 Payout</p>
                      {!phoneVerified && (
                        <button onClick={handleVerifyPhone} className="text-xs text-[#641AE4] font-bold hover:underline">Verify Phone</button>
                      )}
                    </div>

                    {/* Tier 2 */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${userTier >= 2 ? "border-[#C8F55A]/50 bg-[#C8F55A]/5" : "border-[#2D2D3D] shadow-inner"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#C8F55A]">TIER 2</span>
                        {ninVerified ? <CheckCircle className="w-4 h-4 text-[#C8F55A]" /> : <div className="w-4 h-4 rounded-full border border-[#B0B0B8]" />}
                      </div>
                      <h4 className="font-semibold text-[#F0F0F0] mb-1">Identity Verified</h4>
                      <p className="text-xs text-[#B0B0B8] mb-3">Limit: Up to $50,000</p>
                      {!ninVerified && phoneVerified && (
                        <button onClick={() => setShowIdModal(true)} className="text-xs text-[#641AE4] font-bold hover:underline">Verify Identity</button>
                      )}
                      {!phoneVerified && <p className="text-[10px] text-[#B0B0B8] italic">Complete Tier 1 first</p>}
                    </div>

                    {/* Tier 3 */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${userTier >= 3 ? "border-[#C8F55A]/50 bg-[#C8F55A]/5" : "border-[#2D2D3D] shadow-inner"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#C8F55A]">TIER 3</span>
                        {cacVerified ? <CheckCircle className="w-4 h-4 text-[#C8F55A]" /> : <div className="w-4 h-4 rounded-full border border-[#B0B0B8]" />}
                      </div>
                      <h4 className="font-semibold text-[#F0F0F0] mb-1">CAC Verified</h4>
                      <p className="text-xs text-[#B0B0B8] mb-3">Limit: Unrestricted ($50k+)</p>
                      {!cacVerified && ninVerified && (
                        <button onClick={() => setShowCacModal(true)} className="text-xs text-[#641AE4] font-bold hover:underline">Verify CAC</button>
                      )}
                      {!ninVerified && <p className="text-[10px] text-[#B0B0B8] italic">Complete Tier 2 first</p>}
                    </div>
                  </div>
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
              <div className="space-y-6">
                {hasSavedBank && !isEditingBank ? (
                  /* Linked Bank Account Premium Card */
                  <div className="p-6 bg-gradient-to-br from-[#1E1E2B] to-[#2D2D3D] border border-[#C8F55A]/20 rounded-xl relative overflow-hidden shadow-xl shadow-black/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8F55A]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8F55A] bg-[#C8F55A]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5" /> Linked & Verified
                        </span>
                        <h3 className="text-xl font-bold text-[#F0F0F0] mt-3">{bankAccountData.bankName}</h3>
                        <p className="text-xs text-[#B0B0B8] mt-1">Settlement Account</p>
                      </div>
                      <div className="p-3 bg-[#C8F55A]/10 rounded-xl">
                        <CreditCard className="w-6 h-6 text-[#C8F55A]" />
                      </div>
                    </div>

                    <div className="my-8">
                      <p className="text-xs text-[#B0B0B8] uppercase tracking-widest font-mono">Account Number</p>
                      <p className="text-2xl font-bold text-[#F0F0F0] tracking-wider font-mono mt-1">
                        {bankAccountData.accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#2D2D3D]">
                      <div>
                        <p className="text-xs text-[#B0B0B8] uppercase tracking-wider font-mono">Account Holder</p>
                        <p className="text-base font-semibold text-[#F0F0F0]">{bankAccountData.accountName}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setBankDetails({
                            bankCode: bankAccountData.bankCode || "",
                            bankName: bankAccountData.bankName || "",
                            accountNumber: bankAccountData.accountNumber || "",
                            accountName: bankAccountData.accountName || ""
                          })
                          setIsVerified(true)
                          setIsEditingBank(true)
                        }}
                        className="px-4 py-2 text-xs font-semibold text-[#F0F0F0] bg-[#641AE4]/20 border border-[#641AE4]/40 hover:bg-[#641AE4]/30 rounded-lg transition-all"
                      >
                        Change Bank Account
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  /* Edit / Link Bank Form */
                  <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-semibold text-[#F0F0F0]">
                            {hasSavedBank ? "Update Payout Account" : "Naira Payout Account"}
                          </h2>
                          <p className="text-sm text-[#B0B0B8] mt-1">
                            Link your bank account to receive Naira payments
                          </p>
                        </div>
                        {hasSavedBank && (
                          <button
                            onClick={() => {
                              setBankDetails({
                                bankCode: bankAccountData.bankCode || "",
                                bankName: bankAccountData.bankName || "",
                                accountNumber: bankAccountData.accountNumber || "",
                                accountName: bankAccountData.accountName || ""
                              })
                              setIsVerified(true)
                              setIsEditingBank(false)
                            }}
                            className="text-xs text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
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
                  </div>
                )}

                {/* Auto Payout Section */}
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
        onClose={() => { setShowOtpModal(false); setPendingAction(null); setOtpPreSent(false) }}
        onVerified={(otp) => {
          if (pendingAction === "phone_verification") {
            handlePhoneOtpVerified(otp!)
          } else {
            handleOtpVerified()
          }
        }}
        onPhoneSubmit={(phone) => setProfileForm(prev => ({ ...prev, phoneNumber: phone }))}
        title={pendingAction === "phone_number" ? "Verify Phone Change" : pendingAction === "phone_verification" ? "Verify Phone Number" : "Verify Bank Account Change"}
        description={pendingAction === "phone_verification" ? "Enter the code sent to your phone" : "For your security, please verify this action"}
        email={profile?.email || ""}
        phoneNumber={profile?.phoneNumber}
        showPhoneInput={pendingAction === "phone_verification" && !profile?.phoneNumber}
        actionType={pendingAction === "phone_verification" ? "phone_verification" : (pendingAction || "bank_account") as any}
        initialOtpSent={otpPreSent}
      />

      {/* Identity Modal */}
      <AnimatePresence>
        {showIdModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1E1E2B] border-2 border-[#641AE4] rounded-2xl p-8 max-w-md w-full relative">
              <button onClick={() => setShowIdModal(false)} className="absolute top-4 right-4 text-[#B0B0B8] hover:text-[#F0F0F0]"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-bold text-[#F0F0F0] mb-4 text-center">Identity Verification</h3>
              <p className="text-[#B0B0B8] text-center mb-6">Verify your identity to upgrade to Tier 2.</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-2">ID Type</label>
                <select 
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full bg-[#2D2D3D] border-2 border-transparent focus:border-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded-xl outline-none appearance-none"
                >
                  <option value="nin">National ID Number (NIN)</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">International Passport</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#B0B0B8] mb-2">ID Number</label>
                <input 
                  type="text" 
                  value={idValue} 
                  onChange={(e) => setIdValue(e.target.value)} 
                  placeholder="Enter ID number" 
                  className="w-full bg-[#2D2D3D] border-2 border-transparent focus:border-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded-xl outline-none tracking-widest" 
                />
              </div>

              <button onClick={handleVerifyIdentity} disabled={verifyIdentityMutation.isPending || !idValue} className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] flex items-center justify-center gap-2 disabled:opacity-50">
                {verifyIdentityMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CAC Modal */}
      <BusinessVerificationModal
        isOpen={showCacModal}
        onClose={() => setShowCacModal(false)}
        onVerified={() => {
          toast.success("Business verification submitted successfully!")
        }}
      />
    </motion.div>
  )
}
