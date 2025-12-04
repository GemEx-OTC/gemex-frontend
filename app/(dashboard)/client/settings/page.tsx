"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut, CheckCircle, AlertCircle, Loader2, User, Bell, Shield, CreditCard, ChevronRight } from "lucide-react"
import { NIGERIAN_BANKS } from "@/lib/constants"

type TabType = "account" | "bank" | "notifications" | "security"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("account")
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactor: true,
    tradeAlerts: true,
    priceAlerts: false,
  })

  // Bank Account State
  const [bankDetails, setBankDetails] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()
    router.push("/auth/login")
  }

  const handleAccountNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10)
    setBankDetails((prev) => ({ ...prev, accountNumber: cleaned, accountName: "" }))
    setIsVerified(false)
    setVerificationError("")

    // Auto-verify when 10 digits are entered and bank is selected
    if (cleaned.length === 10 && bankDetails.bankCode) {
      verifyAccountNumber(cleaned, bankDetails.bankCode)
    }
  }

  const verifyAccountNumber = async (accountNumber: string, bankCode: string) => {
    setIsVerifying(true)
    setVerificationError("")

    // Mock API call - In production, this would call the bank verification API
    setTimeout(() => {
      const mockNames = ["John Doe", "Jane Smith", "Michael Johnson", "Sarah Williams", "David Brown"]
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]

      setBankDetails((prev) => ({ ...prev, accountName: randomName }))
      setIsVerified(true)
      setIsVerifying(false)
    }, 1500)
  }

  const handleSaveBankAccount = () => {
    if (!isVerified) {
      setVerificationError("Please verify your account number first")
      return
    }

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const tabs = [
    { id: "account" as TabType, label: "Account", icon: User },
    { id: "bank" as TabType, label: "Bank Account", icon: CreditCard },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Settings" subtitle="Manage your account preferences and security" />

      <div className="max-w-5xl">
        {/* Tab Navigation */}
        <div className="mb-8">
          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-2 p-1 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-[#641AE4] text-[#F0F0F0] shadow-lg shadow-[#641AE4]/20"
                      : "text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-[#641AE4]/20 border-2 border-[#641AE4] text-[#F0F0F0]"
                      : "bg-[#1E1E2B]/60 border border-[#2D2D3D] text-[#B0B0B8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? "rotate-90" : ""}`} />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Personal Information</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+234 801 234 5678"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>

                {/* KYC Status */}
                <div className="p-6 bg-gradient-to-br from-[#C8F55A]/10 to-[#C8F55A]/5 border border-[#C8F55A]/30 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C8F55A]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#C8F55A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#F0F0F0] mb-1">KYC Verified</h3>
                      <p className="text-sm text-[#B0B0B8] mb-3">
                        Your account is fully verified. You can trade without limits.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#B0B0B8]">
                        <span>Verified on Dec 1, 2024</span>
                        <span>•</span>
                        <span>ID: KYC-2024-001</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Account Tab */}
            {activeTab === "bank" && (
              <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F0F0F0]">Naira Payout Account</h2>
                    <p className="text-sm text-[#B0B0B8] mt-1">
                      Link your bank account to receive Naira payments
                    </p>
                  </div>
                  {isSaved && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-[#C8F55A]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Saved!</span>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-5 mt-6">
                  {/* Bank Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Select Bank</label>
                    <select
                      value={bankDetails.bankCode}
                      onChange={(e) => {
                        const newBankCode = e.target.value
                        setBankDetails((prev) => ({ ...prev, bankCode: newBankCode, accountName: "" }))
                        setIsVerified(false)
                        setVerificationError("")
                        
                        // Auto-verify if account number is already complete
                        if (bankDetails.accountNumber.length === 10 && newBankCode) {
                          verifyAccountNumber(bankDetails.accountNumber, newBankCode)
                        }
                      }}
                      className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Choose your bank</option>
                      {NIGERIAN_BANKS.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Account Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => handleAccountNumberChange(e.target.value)}
                        placeholder="Enter 10-digit account number"
                        maxLength={10}
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 pr-12 rounded transition-all focus:outline-none font-mono"
                      />
                      {isVerifying && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-5 h-5 text-[#C8F55A] animate-spin" />
                        </div>
                      )}
                    </div>
                    {!bankDetails.bankCode && bankDetails.accountNumber.length > 0 && (
                      <p className="text-xs text-[#B0B0B8] mt-2">Please select a bank first</p>
                    )}
                  </div>

                  {/* Account Name Display */}
                  <AnimatePresence>
                    {isVerified && bankDetails.accountName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-[#C8F55A]" />
                          <div>
                            <p className="text-sm text-[#B0B0B8]">Account Name</p>
                            <p className="font-semibold text-[#F0F0F0]">{bankDetails.accountName}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {verificationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <p className="text-sm text-red-400">{verificationError}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Save Button */}
                  {isVerified && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveBankAccount}
                      className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
                    >
                      Save Bank Account
                    </motion.button>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8]">
                    <strong className="text-[#F0F0F0]">Security Note:</strong> Your bank account details are encrypted
                    and securely stored. We use bank verification APIs to ensure the account belongs to you.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Notification Preferences</h2>
                <p className="text-sm text-[#B0B0B8] mb-6">Choose how you want to receive updates about your trades</p>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      desc: "Receive trade updates and important announcements via email",
                    },
                    {
                      key: "smsNotifications",
                      label: "SMS Notifications",
                      desc: "Get instant alerts via SMS for time-sensitive updates",
                    },
                    {
                      key: "tradeAlerts",
                      label: "Trade Status Alerts",
                      desc: "Notifications when your trade status changes",
                    },
                    {
                      key: "priceAlerts",
                      label: "Price Movement Alerts",
                      desc: "Get notified about significant crypto price changes",
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.key}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-[#F0F0F0]">{item.label}</p>
                        <p className="text-sm text-[#B0B0B8] mt-1">{item.desc}</p>
                      </div>
                      <motion.button
                        onClick={() => handleToggle(item.key as keyof typeof settings)}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          settings[item.key as keyof typeof settings] ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: settings[item.key as keyof typeof settings] ? 24 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                        />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
                >
                  Save Preferences
                </motion.button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Security Settings</h2>

                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg"
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-[#F0F0F0]">Two-Factor Authentication</p>
                        <p className="text-sm text-[#B0B0B8] mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <motion.button
                        onClick={() => handleToggle("twoFactor")}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          settings.twoFactor ? "bg-[#C8F55A]" : "bg-[#1E1E2B]"
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: settings.twoFactor ? 24 : 2,
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                        />
                      </motion.button>
                    </motion.div>
                  </div>
                </div>

                <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                  <h3 className="text-lg font-semibold text-[#F0F0F0] mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
                  >
                    Update Password
                  </motion.button>
                </div>

                {/* Logout Button - Always visible in Security tab */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
