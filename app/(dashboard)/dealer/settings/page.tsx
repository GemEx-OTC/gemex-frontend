"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut, CheckCircle, AlertCircle, Loader2, User, Bell, Shield, CreditCard, ChevronRight, TrendingUp, Info, AlertTriangle } from "lucide-react"
import { NIGERIAN_BANKS } from "@/lib/constants"

type TabType = "account" | "rates" | "bank" | "notifications" | "security"

export default function DealerSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("account")
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    quoteAlerts: true,
    tradeAlerts: true,
    twoFactor: true,
  })

  // Dealer Rates State
  const [dealerRates, setDealerRates] = useState({
    usdtNgn: "1560",
    btcNgn: "43200000",
    usdcNgn: "1558",
  })
  const [ratesSaved, setRatesSaved] = useState(false)
  const [showRatesConfirmModal, setShowRatesConfirmModal] = useState(false)
  const [ratesProcessing, setRatesProcessing] = useState(false)

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

    if (cleaned.length === 10 && bankDetails.bankCode) {
      verifyAccountNumber(cleaned, bankDetails.bankCode)
    }
  }

  const verifyAccountNumber = async (accountNumber: string, bankCode: string) => {
    setIsVerifying(true)
    setVerificationError("")

    setTimeout(() => {
      const mockNames = ["Dealer Account", "Trading Corp", "Exchange Services", "Finance Ltd"]
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

  const handleSaveRates = () => {
    setShowRatesConfirmModal(true)
  }

  const handleConfirmSaveRates = () => {
    setRatesProcessing(true)
    setTimeout(() => {
      setRatesProcessing(false)
      setShowRatesConfirmModal(false)
      setRatesSaved(true)
      setTimeout(() => setRatesSaved(false), 3000)
    }, 1500)
  }

  const tabs = [
    { id: "account" as TabType, label: "Account", icon: User },
    { id: "rates" as TabType, label: "Quote Rates", icon: TrendingUp },
    { id: "bank" as TabType, label: "Bank Account", icon: CreditCard },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Dealer Settings" subtitle="Manage your rates, account preferences and security" />

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
                  <h2 className="text-lg font-semibold text-[#F0F0F0] mb-6">Dealer Profile</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Dealer User"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue="dealer@gemex.demo"
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

                {/* Dealer Status */}
                <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#641AE4]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#F0F0F0] mb-1">Active Dealer</h3>
                      <p className="text-sm text-[#B0B0B8] mb-3">
                        You are authorized to generate firm quotes and manage client trades.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#B0B0B8]">
                        <span>Dealer since Jan 15, 2024</span>
                        <span>•</span>
                        <span>ID: DLR-2024-001</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Rates Tab */}
            {activeTab === "rates" && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#F0F0F0]">Bulk Quote Rates</h2>
                      <p className="text-sm text-[#B0B0B8] mt-1">
                        Set your rates for client bulk trade quotes
                      </p>
                    </div>
                    {ratesSaved && (
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
                    <div>
                      <label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDT to NGN Rate</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dealerRates.usdtNgn}
                          onChange={(e) => setDealerRates({ ...dealerRates, usdtNgn: e.target.value })}
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
                          value={dealerRates.usdcNgn}
                          onChange={(e) => setDealerRates({ ...dealerRates, usdcNgn: e.target.value })}
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
                          value={dealerRates.btcNgn}
                          onChange={(e) => setDealerRates({ ...dealerRates, btcNgn: e.target.value })}
                          className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                        />
                        <span className="text-[#B0B0B8]">NGN</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleSaveRates}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
                  >
                    Save Quote Rates
                  </motion.button>
                </div>

                {/* Rate Info Box */}
                <div className="p-5 bg-[#1E1E2B]/80 border border-[#2D2D3D] rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#F0F0F0] mb-2">How Dealer Rates Work</h4>
                      <ul className="text-sm text-[#B0B0B8] space-y-2">
                        <li>• <strong className="text-[#F0F0F0]">Your rates</strong> are used when generating firm quotes for client bulk trades</li>
                        <li>• <strong className="text-[#F0F0F0]">Admin global rates</strong> are used for auto-payout calculations on settled trades</li>
                        <li>• You can adjust rates based on market conditions and trade volume</li>
                      </ul>
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
                    <h2 className="text-lg font-semibold text-[#F0F0F0]">Payout Account</h2>
                    <p className="text-sm text-[#B0B0B8] mt-1">
                      Link your bank account for commission payouts
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
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Select Bank</label>
                    <select
                      value={bankDetails.bankCode}
                      onChange={(e) => {
                        const newBankCode = e.target.value
                        setBankDetails((prev) => ({ ...prev, bankCode: newBankCode, accountName: "" }))
                        setIsVerified(false)
                        setVerificationError("")
                        
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

                <div className="mt-6 p-4 bg-[#1E1E2B]/60 rounded-lg">
                  <p className="text-xs text-[#B0B0B8]">
                    <strong className="text-[#F0F0F0]">Security Note:</strong> Your bank account details are encrypted
                    and securely stored. Commission payouts are processed to this account.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
                <h2 className="text-lg font-semibold text-[#F0F0F0] mb-2">Notification Preferences</h2>
                <p className="text-sm text-[#B0B0B8] mb-6">Choose how you want to receive updates about quotes and trades</p>

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
                      key: "quoteAlerts",
                      label: "Quote Request Alerts",
                      desc: "Get notified when clients request new quotes",
                    },
                    {
                      key: "tradeAlerts",
                      label: "Trade Status Alerts",
                      desc: "Notifications when trade status changes",
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
              </div>
            )}
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="my-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </AnimatePresence>

        {/* Rate Confirmation Modal */}
        <AnimatePresence>
          {showRatesConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !ratesProcessing && setShowRatesConfirmModal(false)}
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
                    <TrendingUp className="w-8 h-8 text-[#641AE4]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Confirm Rate Update</h3>
                  <p className="text-[#B0B0B8]">Review your new quote rates before saving</p>
                </div>

                {/* Warning */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-400 font-medium mb-1">Important</p>
                      <p className="text-xs text-[#B0B0B8]">
                        These rates will be used for all new bulk quotes you generate for clients.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rate Summary */}
                <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">USDT/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(dealerRates.usdtNgn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">USDC/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(dealerRates.usdcNgn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B8]">BTC/NGN:</span>
                    <span className="text-[#C8F55A] font-mono">₦{Number(dealerRates.btcNgn).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRatesConfirmModal(false)}
                    disabled={ratesProcessing}
                    className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmSaveRates}
                    disabled={ratesProcessing}
                    className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ratesProcessing ? "Saving..." : "Confirm & Save"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
