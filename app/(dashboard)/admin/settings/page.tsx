"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import { 
  Shield, LogOut, Loader2, TrendingUp, User, Info, RefreshCw, 
  Building2, CheckCircle2, AlertCircle 
} from "lucide-react"
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
  useBtcPriceInfo,
  useBankAccount,
  useUpdateBankAccount,
  useVerifyBankAccount,
} from "@/lib/hooks/use-user-settings"
import { NIGERIAN_BANKS } from "@/lib/constants"

export default function AdminSettingsPage() {
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpAction, setOtpAction] = useState<"exchange_rates" | "bank_account">("exchange_rates")
  const logoutMutation = useLogout()
  
  // Profile
  const { data: profile, isLoading: profileLoading } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const [profileForm, setProfileForm] = useState({ fullName: "", phoneNumber: "" })
  
  // Exchange Rates
  const { data: exchangeRatesData, isLoading: ratesLoading } = useGlobalExchangeRates()
  const { data: btcPriceData, isLoading: btcLoading, refetch: refetchBtcPrice } = useBtcPriceInfo()
  const updateRatesMutation = useUpdateGlobalExchangeRates()
  const [usdtNgnRate, setUsdtNgnRate] = useState("")
  const [btcUsdRate, setBtcUsdRate] = useState("")
  const [btcUsdDeduction, setBtcUsdDeduction] = useState("500")
  
  // Bank Account
  const { data: bankAccount, isLoading: bankLoading } = useBankAccount()
  const updateBankMutation = useUpdateBankAccount()
  const verifyBankMutation = useVerifyBankAccount()
  const [bankForm, setBankForm] = useState({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  })
  const [isVerifyingBank, setIsVerifyingBank] = useState(false)
  
  // 2FA
  const toggleTwoFactorMutation = useToggleTwoFactor()
  const twoFactorEnabled = profile?.twoFactorEnabled || false

  // Initialize forms
  useEffect(() => {
    if (profile) {
      setProfileForm({ fullName: profile.fullName || "", phoneNumber: profile.phoneNumber || "" })
    }
  }, [profile])

  useEffect(() => {
    if (exchangeRatesData) {
      setUsdtNgnRate(exchangeRatesData.USDT_NGN?.toString() || "1580")
      setBtcUsdRate(exchangeRatesData.BTC_USD_RATE?.toString() || exchangeRatesData.USDT_NGN?.toString() || "1580")
      setBtcUsdDeduction(exchangeRatesData.BTC_USD_DEDUCTION?.toString() || "500")
    }
  }, [exchangeRatesData])

  useEffect(() => {
    if (bankAccount) {
      setBankForm({
        bankCode: bankAccount.bankCode || "",
        bankName: bankAccount.bankName || "",
        accountNumber: bankAccount.accountNumber || "",
        accountName: bankAccount.accountName || "",
      })
    }
  }, [bankAccount])

  const handleLogout = () => logoutMutation.mutate()

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm, {
      onSuccess: () => toast.success("Profile updated!"),
      onError: () => toast.error("Failed to update profile"),
    })
  }

  const handleSaveRates = () => {
    if (twoFactorEnabled) {
      setOtpAction("exchange_rates")
      setShowOtpModal(true)
      return
    }
    performRatesSave()
  }

  const performRatesSave = () => {
    updateRatesMutation.mutate({ 
      USDT_NGN: Number(usdtNgnRate),
      BTC_USD_RATE: Number(btcUsdRate),
      BTC_USD_DEDUCTION: Number(btcUsdDeduction),
    }, {
      onSuccess: () => toast.success("Exchange rates updated! 📈"),
      onError: () => toast.error("Failed to update rates"),
    })
  }

  const handleVerifyBank = async () => {
    if (!bankForm.bankCode || !bankForm.accountNumber || bankForm.accountNumber.length !== 10) {
      toast.error("Please enter a valid bank and 10-digit account number")
      return
    }
    
    setIsVerifyingBank(true)
    verifyBankMutation.mutate(
      { bankCode: bankForm.bankCode, accountNumber: bankForm.accountNumber },
      {
        onSuccess: (data) => {
          setBankForm(prev => ({
            ...prev,
            accountName: data.accountName,
            bankName: NIGERIAN_BANKS.find(b => b.code === prev.bankCode)?.name || prev.bankName,
          }))
          toast.success("Account verified!")
          setIsVerifyingBank(false)
        },
        onError: () => {
          toast.error("Failed to verify account")
          setIsVerifyingBank(false)
        },
      }
    )
  }

  const handleSaveBank = () => {
    if (!bankForm.accountName) {
      toast.error("Please verify your account first")
      return
    }
    
    if (twoFactorEnabled) {
      setOtpAction("bank_account")
      setShowOtpModal(true)
      return
    }
    performBankSave()
  }

  const performBankSave = () => {
    updateBankMutation.mutate(bankForm, {
      onSuccess: () => toast.success("Bank account updated! 🏦"),
      onError: () => toast.error("Failed to update bank account"),
    })
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    if (otpAction === "exchange_rates") {
      performRatesSave()
    } else {
      performBankSave()
    }
  }

  const handleToggleTwoFactor = (enabled: boolean) => {
    toggleTwoFactorMutation.mutate(enabled, {
      onSuccess: () => toast.success(enabled ? "2FA enabled! 🔐" : "2FA disabled"),
    })
  }

  const calculatedBtcNgn = btcPriceData && btcUsdRate 
    ? Math.round((btcPriceData.btcUsd - Number(btcUsdDeduction)) * Number(btcUsdRate))
    : exchangeRatesData?.BTC_NGN || 0

  const formatBtcNgn = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(2)}M`
    return `₦${value.toLocaleString()}`
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="System Settings" subtitle="Configure platform settings and your account" />

      <div className="grid gap-6 lg:grid-cols-2 max-w-6xl">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Admin Profile</h2>
                <p className="text-sm text-muted-foreground">Your account information</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-muted/50 text-muted-foreground px-4 py-3 rounded-xl cursor-not-allowed border border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  placeholder="+234..."
                  className="w-full bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <motion.button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </motion.button>
          </div>

          {/* Bank Account Card */}
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Bank Account</h2>
                <p className="text-sm text-muted-foreground">For receiving payouts</p>
              </div>
              {bankAccount?.isVerified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">Verified</span>
                </div>
              )}
            </div>

            {bankLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Bank</label>
                  <select
                    value={bankForm.bankCode}
                    onChange={(e) => {
                      const bank = NIGERIAN_BANKS.find(b => b.code === e.target.value)
                      setBankForm({ 
                        ...bankForm, 
                        bankCode: e.target.value,
                        bankName: bank?.name || "",
                        accountName: "" 
                      })
                    }}
                    className="w-full bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Bank</option>
                    {NIGERIAN_BANKS.map(bank => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Account Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10), accountName: "" })}
                      placeholder="0123456789"
                      maxLength={10}
                      className="flex-1 bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    />
                    <motion.button
                      onClick={handleVerifyBank}
                      disabled={isVerifyingBank || bankForm.accountNumber.length !== 10 || !bankForm.bankCode}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 rounded-xl font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifyingBank ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                    </motion.button>
                  </div>
                </div>

                {bankForm.accountName && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Account Verified</span>
                    </div>
                    <p className="text-foreground font-semibold">{bankForm.accountName}</p>
                    <p className="text-sm text-muted-foreground">{bankForm.bankName}</p>
                  </motion.div>
                )}

                <motion.button
                  onClick={handleSaveBank}
                  disabled={updateBankMutation.isPending || !bankForm.accountName}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {updateBankMutation.isPending ? "Saving..." : "Save Bank Account"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Security</h2>
                <p className="text-sm text-muted-foreground">Protect your account</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex-1 pr-4">
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground mt-1">Require OTP for sensitive actions</p>
              </div>
              <motion.button
                onClick={() => handleToggleTwoFactor(!twoFactorEnabled)}
                disabled={toggleTwoFactorMutation.isPending}
                className={`relative w-14 h-8 rounded-full transition-all ${twoFactorEnabled ? "bg-secondary" : "bg-muted-foreground/30"}`}
              >
                <motion.div
                  animate={{ x: twoFactorEnabled ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                />
              </motion.button>
            </div>

            {twoFactorEnabled && (
              <div className="mt-4 p-4 bg-secondary/10 border border-secondary/30 rounded-xl">
                <p className="text-sm text-secondary font-medium mb-2">🔐 Protected Actions</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Password changes</li>
                  <li>• Exchange rate updates</li>
                  <li>• Bank account changes</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Exchange Rates Card */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Exchange Rates</h2>
                <p className="text-sm text-muted-foreground">Platform conversion rates</p>
              </div>
            </div>

            {ratesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* USDT/USDC Rate Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">USDT/USDC → NGN Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-lg">₦</span>
                    <input
                      type="number"
                      value={usdtNgnRate}
                      onChange={(e) => setUsdtNgnRate(e.target.value)}
                      className="flex-1 bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xl"
                      placeholder="1580"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Rate for USDT and USDC trades</p>
                </div>

                {/* BTC USD Rate Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">BTC Dollar → NGN Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-lg">₦</span>
                    <input
                      type="number"
                      value={btcUsdRate}
                      onChange={(e) => setBtcUsdRate(e.target.value)}
                      className="flex-1 bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xl"
                      placeholder="1580"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Dollar rate used for BTC/NGN calculation</p>
                </div>

                {/* BTC Deduction Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">BTC Price Deduction</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-lg">$</span>
                    <input
                      type="number"
                      value={btcUsdDeduction}
                      onChange={(e) => setBtcUsdDeduction(e.target.value)}
                      className="flex-1 bg-muted border border-border focus:border-primary text-foreground px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                      placeholder="500"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Amount deducted from BTC/USD price</p>
                </div>

                {/* BTC Price Info */}
                <div className="p-4 bg-card border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">₿</span>
                      <span className="font-semibold text-foreground">Live BTC Price</span>
                    </div>
                    <button
                      onClick={() => refetchBtcPrice()}
                      disabled={btcLoading}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-muted-foreground ${btcLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {btcPriceData ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bybit Price</span>
                        <span className="font-mono text-foreground">${btcPriceData.btcUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deduction</span>
                        <span className="font-mono text-destructive">-${btcUsdDeduction}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">BTC Dollar Rate</span>
                        <span className="font-mono text-foreground">₦{Number(btcUsdRate).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">BTC/NGN Rate</span>
                          <span className="font-mono font-bold text-secondary text-lg">{formatBtcNgn(calculatedBtcNgn)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading BTC price...</p>
                  )}
                </div>

                {/* Formula */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      BTC/NGN = (Bybit BTC/USD - Deduction) × BTC Dollar Rate
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleSaveRates}
                  disabled={updateRatesMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {updateRatesMutation.isPending ? "Saving..." : "Save Exchange Rates"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <ChangePasswordForm />

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-foreground bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-all disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </motion.button>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        title={otpAction === "exchange_rates" ? "Verify Rate Update" : "Verify Bank Update"}
        description="Enter the OTP sent to your email"
        email={profile?.email || ""}
        actionType={otpAction}
      />
    </motion.div>
  )
}
