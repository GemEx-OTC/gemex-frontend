"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  Users,
  Wallet,
  TrendingUp,
  Copy,
  Check,
  ArrowUpRight,
  AlertCircle,
  Banknote,
  History as HistoryIcon,
  Loader2,
  Lock,
  Building2,
  ChevronRight,
  ShieldCheck,
  Search,
  X,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import {
  getReferralStats,
  getReferralHistory,
  getReferralWithdrawals,
  withdrawReferralBalance,
  getReferralBanks,
  verifyReferralPayoutAccount,
  updateReferralPayoutAccount,
  type ReferralStats,
  type ReferralBonusItem,
  type ReferralWithdrawalItem,
} from "@/lib/api/referrals"

const MIN_WITHDRAWAL_NGN = 15000

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export default function ClientReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<ReferralBonusItem[]>([])
  const [withdrawals, setWithdrawals] = useState<ReferralWithdrawalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"bonuses" | "withdrawals">("bonuses")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Payout Account Flow state
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutStep, setPayoutStep] = useState<1 | 2 | 3>(1)
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([])
  const [selectedBank, setSelectedBank] = useState<{ code: string; name: string } | null>(null)
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("")
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false)
  const [verifiedAccountName, setVerifiedAccountName] = useState("")
  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [bankSearchQuery, setBankSearchQuery] = useState("")

  const fetchData = async () => {
    try {
      const [statsData, historyData, withdrawalsData, banksData] = await Promise.all([
        getReferralStats(),
        getReferralHistory(1, 20),
        getReferralWithdrawals(1, 20),
        getReferralBanks().catch(() => []),
      ])
      setStats(statsData)
      setHistory(historyData.bonuses || [])
      setWithdrawals(withdrawalsData.withdrawals || [])
      setBanks(banksData || [])
    } catch (error: any) {
      console.error("Failed to fetch referral data:", error)
      toast.error(error?.message || "Failed to load referral data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const copyReferralCode = () => {
    if (!stats?.referralCode) return
    navigator.clipboard.writeText(stats.referralCode)
    setCopiedCode(true)
    toast.success("Referral code copied!")
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyReferralLink = () => {
    if (!stats?.referralCode) return
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.gemotc.com"
    const link = `${origin}/auth/signup?ref=${encodeURIComponent(stats.referralCode)}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    toast.success("Referral signup link copied!")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    const availableBalance = stats?.balance || 0

    if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL_NGN) {
      toast.error(`Minimum collectible withdrawal amount is ₦${MIN_WITHDRAWAL_NGN.toLocaleString()}`)
      return
    }

    if (availableBalance < MIN_WITHDRAWAL_NGN) {
      toast.error(`You need at least ₦${MIN_WITHDRAWAL_NGN.toLocaleString()} accrued referral balance to withdraw`)
      return
    }

    if (amount > availableBalance) {
      toast.error("Insufficient referral balance")
      return
    }

    const activeBank = stats?.referralBankAccount?.isVerified
      ? stats.referralBankAccount
      : stats?.bankAccount?.isVerified
      ? stats.bankAccount
      : null

    if (!activeBank) {
      toast.error("Please verify and set your payout bank account first")
      setShowPayoutModal(true)
      return
    }

    setIsWithdrawing(true)
    try {
      await withdrawReferralBalance(amount)
      toast.success("Referral withdrawal initiated successfully!")
      setWithdrawAmount("")
      await fetchData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to initiate referral withdrawal")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleVerifyAccount = async () => {
    if (!selectedBank || payoutAccountNumber.length !== 10) return

    setIsVerifyingAccount(true)
    try {
      const res = await verifyReferralPayoutAccount(payoutAccountNumber, selectedBank.code)
      setVerifiedAccountName(res.accountName)
      setPayoutStep(3)
    } catch (error: any) {
      toast.error(error?.message || "Could not verify bank account")
    } finally {
      setIsVerifyingAccount(false)
    }
  }

  const handleSavePayoutAccount = async () => {
    if (!selectedBank) return
    setIsSavingAccount(true)
    try {
      await updateReferralPayoutAccount({
        accountNumber: payoutAccountNumber,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        accountName: verifiedAccountName,
      })
      toast.success("Referral payout bank account saved!")
      resetPayoutFlow()
      await fetchData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to save payout account")
    } finally {
      setIsSavingAccount(false)
    }
  }

  const resetPayoutFlow = () => {
    setShowPayoutModal(false)
    setPayoutStep(1)
    setSelectedBank(null)
    setPayoutAccountNumber("")
    setVerifiedAccountName("")
    setBankSearchQuery("")
  }

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      bank.code.includes(bankSearchQuery)
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Loading referral program...</p>
      </div>
    )
  }

  const balance = stats?.balance || 0
  const progressPercent = Math.min(100, Math.round((balance / MIN_WITHDRAWAL_NGN) * 100))
  const isSuspended = stats?.referralStatus === "suspended"
  const activeBankAccount = stats?.referralBankAccount?.isVerified
    ? stats.referralBankAccount
    : stats?.bankAccount?.isVerified
    ? stats.bankAccount
    : null

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Referral Program"
        subtitle="Earn a one-time ₦1,000 bonus for every referral who completes KYC and trades up to $500"
      />

      {isSuspended && (
        <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Your referral account is currently suspended. Please contact support for assistance.
        </div>
      )}

      {/* Stats Cards - Styled with GemOTC Primary (Violet), Secondary (Neon Lime), and Accent (Blue) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accrued Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border-2 border-primary/40 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Accrued Referral Balance
              </p>
              <p className="text-3xl font-bold text-secondary mt-1">{formatCurrency(balance)}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {balance >= MIN_WITHDRAWAL_NGN
                  ? "Ready to collect!"
                  : `${formatCurrency(Math.max(0, MIN_WITHDRAWAL_NGN - balance))} more to unlock withdrawal`}
              </span>
              <span className="font-semibold text-secondary">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Total Earned Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-emerald-500/10 border-2 border-secondary/40 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/20 border border-secondary/30 text-secondary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Earned</p>
              <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(stats?.totalEarned || 0)}</p>
              <p className="text-xs text-secondary mt-1">
                From ${(stats?.totalVolumeUSD || 0).toLocaleString()} qualified referral volume
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Referrals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-2 border-blue-500/40 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/20 border border-accent/30 text-accent">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Referrals</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats?.referralCount || 0}</p>
              <p className="text-xs text-blue-400 mt-1">One-time ₦1,000 per verified $500 trader</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share Code + Withdraw Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="gemex-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Share Your Referral Code</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Invite friends and traders to GemOTC. You earn a{" "}
              <strong className="text-secondary">one-time ₦1,000 referral bonus</strong> for every referred user who{" "}
              <strong className="text-foreground">completes KYC</strong> and{" "}
              <strong className="text-foreground">trades up to $500</strong>.
            </p>

            {/* Qualification Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">1. Friend signs up</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">2. Completes KYC</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span className="text-xs font-medium text-foreground">3. Trades $500+ → ₦1,000</span>
              </div>
            </div>

            {/* Unique Code Box */}
            <div className="p-4 bg-background/80 rounded-xl border border-primary/30 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Your Unique Referral Code
                </span>
                <span className="text-xl font-mono font-bold text-secondary">
                  {stats?.referralCode || "GEM-XXXXXX"}
                </span>
              </div>
              <button
                onClick={copyReferralCode}
                className="gemex-button-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            {/* Direct Signup Link Box */}
            <div className="p-4 bg-background/80 rounded-xl border border-border flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                  Direct Referral Signup Link
                </span>
                <span className="text-xs font-mono text-muted-foreground truncate">
                  {typeof window !== "undefined" ? window.location.origin : "https://app.gemotc.com"}/auth/signup?ref=
                  {stats?.referralCode || "GEM-XXXXXX"}
                </span>
              </div>
              <button
                onClick={copyReferralLink}
                className="px-3.5 py-2 rounded-xl bg-muted hover:bg-primary/20 hover:text-primary text-foreground border border-border transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-secondary" /> : <LinkIcon className="w-4 h-4" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/30">
            <p className="text-xs text-foreground text-center font-medium">
              One-time <span className="text-secondary font-bold">₦1,000</span> bonus per KYC-verified referral with{" "}
              <span className="text-foreground font-bold">$500+</span> traded • Minimum collectible balance:{" "}
              <span className="text-secondary font-bold">₦15,000</span>
            </p>
          </div>
        </motion.div>

        {/* Withdraw Earnings Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="gemex-card p-6 sm:p-8 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-secondary/15 text-secondary border border-secondary/30">
              <Banknote className="w-5 h-5" />
            </div>
            Collect Referral Earnings
          </h2>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Amount to Withdraw (NGN)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-secondary">
                  ₦
                </span>
                <input
                  type="number"
                  min={MIN_WITHDRAWAL_NGN}
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min ₦15,000"
                  className="w-full bg-background border border-border focus:border-primary text-foreground pl-10 pr-4 py-4 rounded-xl outline-none transition-all text-xl font-bold"
                />
              </div>
              <div className="flex justify-between mt-2 px-1">
                <p className="text-xs text-muted-foreground">Minimum Collectible Balance: ₦15,000</p>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(balance))}
                  className="text-xs text-secondary hover:opacity-80 font-bold"
                >
                  Use Max ({formatCurrency(balance)})
                </button>
              </div>
            </div>

            {/* Payout Bank Account Box */}
            <div
              onClick={() => setShowPayoutModal(true)}
              className="p-4 bg-background/60 rounded-xl border border-border hover:border-primary/50 flex items-center gap-4 cursor-pointer transition-all group/payout"
            >
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                  Payout Bank Account
                </p>
                {activeBankAccount ? (
                  <>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activeBankAccount.bankName} • {activeBankAccount.accountNumber}
                    </p>
                    <p className="text-xs text-secondary truncate mt-0.5">{activeBankAccount.accountName}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-amber-400">No verified payout account set</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to verify and link your bank account</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                <span>{activeBankAccount ? "Change" : "Set Up"}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isWithdrawing ||
                isSuspended ||
                balance < MIN_WITHDRAWAL_NGN ||
                Number(withdrawAmount) < MIN_WITHDRAWAL_NGN ||
                Number(withdrawAmount) > balance
              }
              className="w-full gemex-button-primary disabled:opacity-40 disabled:cursor-not-allowed font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Withdrawal...</span>
                </>
              ) : balance < MIN_WITHDRAWAL_NGN ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Minimum ₦15,000 Required to Collect</span>
                </>
              ) : (
                <>
                  <span>Collect Referral Bonus</span>
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* History Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gemex-card p-6 sm:p-8 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-6 border-b border-border w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("bonuses")}
              className={`pb-3.5 text-sm font-bold transition-all relative ${
                activeTab === "bonuses" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Bonus History
              </div>
              {activeTab === "bonuses" && (
                <motion.div layoutId="referralActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`pb-3.5 text-sm font-bold transition-all relative ${
                activeTab === "withdrawals" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-4 h-4" />
                Withdrawal History
              </div>
              {activeTab === "withdrawals" && (
                <motion.div
                  layoutId="referralActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>
          <div className="px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-[10px] text-secondary font-bold uppercase tracking-widest w-fit">
            One-Time ₦1,000 • KYC + $500 Traded
          </div>
        </div>

        {activeTab === "bonuses" ? (
          history.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Referred User
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                      Qualifying Volume (USD)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                      One-Time Bonus
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {history.map((bonus) => (
                    <tr key={bonus.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs uppercase">
                            {(bonus.refereeName || "T").charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{bonus.refereeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-muted-foreground">
                        ${(bonus.amountUSD || bonus.amountUSDT || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 rounded-lg bg-secondary/15 text-secondary border border-secondary/30 font-bold">
                          +{formatCurrency(bonus.bonusNGN)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {new Date(bonus.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                <HistoryIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-lg">No referral bonuses yet</h3>
              <p className="text-muted-foreground max-w-sm mt-1 text-sm">
                Share your referral code or link above. Once a referred user completes KYC and reaches $500 in settled trades, your one-time ₦1,000 bonus will appear here.
              </p>
            </div>
          )
        ) : withdrawals.length > 0 ? (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Bank Account
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {w.fiatTxRef || w.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {w.bankAccount?.bankName} • {w.bankAccount?.accountNumber}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-secondary">{formatCurrency(w.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                          w.status === "completed"
                            ? "bg-secondary/15 text-secondary border-secondary/30"
                            : w.status === "failed"
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Banknote className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-foreground font-bold text-lg">No withdrawals yet</h3>
            <p className="text-muted-foreground max-w-xs mt-1 text-sm">
              Once your accrued referral balance reaches ₦15,000, you can withdraw directly to your bank account.
            </p>
          </div>
        )}
      </motion.div>

      {/* Payout Bank Account Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={resetPayoutFlow} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl z-10"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Set Referral Payout Account</h3>
                  <p className="text-xs text-muted-foreground">Where should we send your referral earnings?</p>
                </div>
              </div>
              <button
                onClick={resetPayoutFlow}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {payoutStep === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Nigerian banks..."
                      value={bankSearchQuery}
                      onChange={(e) => setBankSearchQuery(e.target.value)}
                      className="w-full bg-background border border-border focus:border-primary text-foreground pl-11 pr-4 py-3.5 rounded-xl outline-none text-sm"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filteredBanks.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => {
                          setSelectedBank(bank)
                          setPayoutStep(2)
                        }}
                        className="w-full p-3.5 rounded-xl bg-background/60 hover:bg-primary/15 border border-transparent hover:border-primary/40 flex items-center justify-between transition-all text-left"
                      >
                        <span className="font-medium text-sm text-foreground">{bank.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {payoutStep === 2 && (
                <div className="space-y-5">
                  <div className="p-4 bg-background rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Selected Bank
                      </p>
                      <p className="text-foreground font-bold">{selectedBank?.name}</p>
                    </div>
                    <button
                      onClick={() => setPayoutStep(1)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      10-Digit Account Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={payoutAccountNumber}
                      onChange={(e) => setPayoutAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="0123456789"
                      className="w-full bg-background border border-border focus:border-primary text-foreground px-5 py-4 rounded-xl outline-none text-2xl font-mono font-bold text-center tracking-widest"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleVerifyAccount}
                    disabled={payoutAccountNumber.length !== 10 || isVerifyingAccount}
                    className="w-full gemex-button-primary disabled:opacity-40 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifyingAccount ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Account Details</span>
                        <ShieldCheck className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {payoutStep === 3 && (
                <div className="space-y-6">
                  <div className="p-5 bg-secondary/10 border border-secondary/30 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-muted-foreground">
                      <span>Verified Account Name</span>
                      <span className="text-secondary">Confirmed</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{verifiedAccountName}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-border">
                      <span>{selectedBank?.name}</span>
                      <span className="font-mono font-bold text-secondary">{payoutAccountNumber}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPayoutStep(2)}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3.5 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSavePayoutAccount}
                      disabled={isSavingAccount}
                      className="flex-1 gemex-button-secondary font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingAccount ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Save Account</span>
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
