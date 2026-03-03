"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  CreditCard,
  User,
  DollarSign,
  Shield,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { 
  getSupportedBanks, 
  validateBankAccount, 
  initiateManualPayout,
  type Bank,
  type AdminTrade 
} from "@/lib/api/admin"
import { BankSelector } from "@/components/bank-selector"

interface ManualPayoutModalProps {
  trade: AdminTrade & {
    client?: {
      fullName: string
      email: string
    }
    payoutBankCode?: string
    payoutAccountNumber?: string
    payoutAccountName?: string
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = "amount" | "bank" | "verify" | "confirm" | "processing" | "success"

export function ManualPayoutModal({ trade, isOpen, onClose, onSuccess }: ManualPayoutModalProps) {
  const [step, setStep] = useState<Step>("amount")
  const [banks, setBanks] = useState<Bank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  
  // Form state
  const [amount, setAmount] = useState(trade.nairaAmount.toString())
  const [useUserBank, setUseUserBank] = useState(true)
  const [selectedBankCode, setSelectedBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [narration, setNarration] = useState(`Payout for ${trade.transactionId}`)
  
  // Validation state
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  
  // Processing state
  const [processing, setProcessing] = useState(false)
  const [payoutResult, setPayoutResult] = useState<any>(null)

  // Load banks on mount
  useEffect(() => {
    if (isOpen) {
      loadBanks()
      // Pre-fill user bank details if available and valid
      const hasValidBank = trade.payoutAccountNumber && 
                          trade.payoutAccountNumber !== 'PENDING' && 
                          trade.payoutBankCode !== 'PENDING';
                          
      if (hasValidBank && useUserBank) {
        setAccountNumber(trade.payoutAccountNumber!)
        setAccountName(trade.payoutAccountName || "")
        setSelectedBankCode(trade.payoutBankCode || "")
        setVerified(true)
      } else if (!hasValidBank) {
        // Force manual entry if no valid bank details
        setUseUserBank(false)
        setVerified(false)
      }
    }
  }, [isOpen])

  // Auto-verify account when account number and bank are complete
  useEffect(() => {
    // Only auto-verify if not using user's bank and we have complete details
    if (!useUserBank && accountNumber.length === 10 && selectedBankCode && !verified && !verifying) {
      handleVerifyAccount()
    }
  }, [accountNumber, selectedBankCode, useUserBank])

  const loadBanks = async () => {
    try {
      setLoadingBanks(true)
      // Load banks from API (which uses Monnify's banks list)
      const data = await getSupportedBanks()
      console.log('Banks data received:', { type: typeof data, isArray: Array.isArray(data), length: data?.length })
      
      // Ensure data is an array
      const banksArray = Array.isArray(data) ? data : []
      console.log('Banks array set:', banksArray.length, 'banks')
      setBanks(banksArray)
      
      if (banksArray.length === 0) {
        toast.error("No banks loaded, using fallback")
        throw new Error("Empty banks array")
      }
    } catch (error: any) {
      console.error('Failed to load banks from API:', error)
      // Fallback to local banks list if API fails
      try {
        const localBanks = await import("@/lib/data/banks.json")
        console.log('Local banks loaded:', { type: typeof localBanks, hasDefault: !!localBanks.default })
        
        // Handle both default export and direct array
        const banksArray = Array.isArray(localBanks.default) 
          ? localBanks.default 
          : Array.isArray(localBanks) 
          ? localBanks 
          : []
        
        console.log('Local banks array:', banksArray.length, 'banks')
        setBanks(banksArray)
        
        if (banksArray.length > 0) {
          toast.success(`Loaded ${banksArray.length} banks`)
        }
      } catch (fallbackError) {
        console.error('Failed to load local banks:', fallbackError)
        toast.error("Failed to load banks")
        setBanks([])
      }
    } finally {
      setLoadingBanks(false)
    }
  }

  const handleVerifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) {
      return
    }

    if (accountNumber.length !== 10) {
      return
    }

    try {
      setVerifying(true)
      setVerificationError("")
      setAccountName("") // Clear previous name
      const result = await validateBankAccount(accountNumber, selectedBankCode)
      setAccountName(result.accountName)
      setVerified(true)
      toast.success(`Account verified: ${result.accountName}`)
    } catch (error: any) {
      setVerificationError(error.message || "Failed to verify account")
      setVerified(false)
      setAccountName("")
      toast.error(error.message || "Failed to verify account")
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmitPayout = async () => {
    try {
      setProcessing(true)
      setStep("processing")
      
      const result = await initiateManualPayout({
        tradeId: trade.id,
        amount: parseFloat(amount),
        destinationBankCode: selectedBankCode,
        destinationAccountNumber: accountNumber,
        destinationAccountName: accountName,
        narration,
        useUserBankAccount: useUserBank,
      })
      
      setPayoutResult(result)
      setStep("success")
      toast.success(result.message)
      
      // Call onSuccess after a delay
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payout")
      setStep("confirm")
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setStep("amount")
    setAmount(trade.nairaAmount.toString())
    setUseUserBank(true)
    setSelectedBankCode("")
    setAccountNumber("")
    setAccountName("")
    setVerified(false)
    setVerificationError("")
    setPayoutResult(null)
    onClose()
  }

  const handleNext = () => {
    if (step === "amount") {
      const amountNum = parseFloat(amount)
      if (!amountNum || amountNum <= 0) {
        toast.error("Please enter a valid amount")
        return
      }
      if (amountNum > trade.nairaAmount * 1.1) {
        toast.error("Amount cannot exceed 110% of trade amount")
        return
      }
      setStep("bank")
    } else if (step === "bank") {
      const hasValidBank = trade.payoutAccountNumber && 
                          trade.payoutAccountNumber !== 'PENDING' && 
                          trade.payoutBankCode !== 'PENDING';

      if (useUserBank && hasValidBank) {
        // User's bank is pre-verified
        setAccountNumber(trade.payoutAccountNumber!)
        setAccountName(trade.payoutAccountName || "")
        setSelectedBankCode(trade.payoutBankCode || "")
        setVerified(true)
        setStep("confirm")
      } else if (useUserBank && !hasValidBank) {
        toast.error("No valid bank account found. Please enter details manually.")
        setUseUserBank(false)
      } else {
        // Custom bank - check if verified
        if (!verified) {
          toast.error("Please wait for account verification to complete")
          return
        }
        if (!accountName) {
          toast.error("Account verification failed. Please check details.")
          return
        }
        setStep("confirm")
      }
    }
  }

  const handleBack = () => {
    if (step === "bank") setStep("amount")
    else if (step === "confirm") setStep("bank")
  }

  const selectedBank = Array.isArray(banks) ? banks.find(b => b.code === selectedBankCode) : undefined

  const stepConfig = {
    amount: { title: "Set Amount", icon: DollarSign, progress: 33 },
    bank: { title: "Select Bank", icon: Building2, progress: 66 },
    confirm: { title: "Confirm Payout", icon: CheckCircle, progress: 90 },
    processing: { title: "Processing", icon: Loader2, progress: 95 },
    success: { title: "Success", icon: CheckCircle, progress: 100 },
  }

  const currentStep = stepConfig[step]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={step !== "processing" ? handleClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#2D2D3D]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#C8F55A]/10">
                    <currentStep.icon className={`w-5 h-5 text-[#C8F55A] ${step === "processing" ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F0F0F0]">{currentStep.title}</h3>
                    <p className="text-sm text-[#808090]">Manual Payout for {trade.transactionId}</p>
                  </div>
                </div>
                {step !== "processing" && (
                  <button onClick={handleClose} className="text-[#808090] hover:text-[#F0F0F0] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#2D2D3D] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStep.progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#641AE4] to-[#C8F55A]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Amount */}
                {step === "amount" && (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-300 font-medium mb-1">Trade Information</p>
                          <p className="text-xs text-blue-200/70">
                            Original Amount: ₦{trade.nairaAmount.toLocaleString()} • 
                            Client: {trade.client?.fullName || trade.clientName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                        Payout Amount <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808090] text-lg">₦</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] pl-10 pr-4 py-4 rounded-lg text-lg font-semibold focus:outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-[#808090] mt-2">
                        You can adjust the amount if needed (max 110% of trade amount)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F0F0F0] mb-2">
                        Narration (Optional)
                      </label>
                      <input
                        type="text"
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                        className="w-full bg-[#2D2D3D] border border-[#3D3D4D] focus:border-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded-lg focus:outline-none transition-all"
                        placeholder="Payment description"
                      />
                    </div>
                  </motion.div>
                )}

                {step === "bank" && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      {/* User's Registered Bank Card */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          const hasValidBank = trade.payoutAccountNumber && 
                                              trade.payoutAccountNumber !== 'PENDING' && 
                                              trade.payoutBankCode !== 'PENDING';
                          if (hasValidBank) {
                            setUseUserBank(true)
                            setAccountNumber(trade.payoutAccountNumber!)
                            setAccountName(trade.payoutAccountName || "")
                            setSelectedBankCode(trade.payoutBankCode || "")
                            setVerified(true)
                          } else {
                            toast.error("User's bank account is not fully configured.")
                          }
                        }}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group
                          ${useUserBank 
                            ? "bg-[#641AE4]/10 border-[#641AE4] shadow-[0_0_20px_rgba(100,26,228,0.2)]" 
                            : "bg-[#2D2D3D]/40 border-[#3D3D4D] hover:border-[#4D4D5D]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-colors
                            ${useUserBank ? "bg-[#641AE4] text-white" : "bg-[#3D3D4D] text-[#808090] group-hover:text-[#F0F0F0]"}`}>
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={`font-bold transition-colors ${useUserBank ? "text-[#F0F0F0]" : "text-[#808090]"}`}>
                              Use User's Bank Account
                            </p>
                            <p className="text-sm text-[#808090]">Send to registered account</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {trade.payoutAccountNumber && trade.payoutAccountNumber !== 'PENDING' ? (
                            <>
                              <p className={`text-sm font-mono font-medium ${useUserBank ? "text-[#C8F55A]" : "text-[#808090]"}`}>
                                {trade.payoutAccountNumber}
                              </p>
                              <p className={`text-xs font-medium uppercase tracking-wider ${useUserBank ? "text-[#B0B0B8]" : "text-[#606070]"}`}>
                                {trade.payoutAccountName || "N/A"}
                              </p>
                            </>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md font-medium">
                              NOT CONFIGURED
                            </span>
                          )}
                        </div>

                        {useUserBank && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#C8F55A] rounded-full flex items-center justify-center border-4 border-[#1E1E2B] z-10"
                          >
                            <CheckCircle className="w-3 h-3 text-[#1E1E2B]" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Custom Bank Card */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setUseUserBank(false)
                          if (useUserBank) {
                            setAccountNumber("")
                            setAccountName("")
                            setSelectedBankCode("")
                            setVerified(false)
                          }
                        }}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group
                          ${!useUserBank 
                            ? "bg-[#641AE4]/10 border-[#641AE4] shadow-[0_0_20px_rgba(100,26,228,0.2)]" 
                            : "bg-[#2D2D3D]/40 border-[#3D3D4D] hover:border-[#4D4D5D]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-colors
                            ${!useUserBank ? "bg-[#641AE4] text-white" : "bg-[#3D3D4D] text-[#808090] group-hover:text-[#F0F0F0]"}`}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={`font-bold transition-colors ${!useUserBank ? "text-[#F0F0F0]" : "text-[#808090]"}`}>
                              Use Different Account
                            </p>
                            <p className="text-sm text-[#808090]">Enter custom payout details</p>
                          </div>
                        </div>

                        {!useUserBank && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-[#C8F55A] rounded-full flex items-center justify-center border-4 border-[#1E1E2B] z-10"
                          >
                            <CheckCircle className="w-3 h-3 text-[#1E1E2B]" />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    {!useUserBank && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 pt-6 border-t border-[#2D2D3D]/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-semibold text-[#B0B0B8] mb-2 uppercase tracking-wider">
                              Select Bank
                            </label>
                            <BankSelector
                              banks={banks}
                              value={selectedBankCode}
                              onChange={(code, name) => {
                                setSelectedBankCode(code)
                                setVerified(false)
                                setAccountName("")
                              }}
                              isLoading={loadingBanks}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#B0B0B8] mb-2 uppercase tracking-wider">
                              Account Number
                            </label>
                            <div className="relative group">
                              <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                                  setAccountNumber(value)
                                  setVerified(false)
                                  setAccountName("")
                                  setVerificationError("")
                                }}
                                className="w-full bg-[#2D2D3D] border-2 border-[#3D3D4D] group-hover:border-[#4D4D5D] focus:border-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded-xl focus:outline-none transition-all font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:text-[#5D5D6D]"
                                placeholder="0000000000"
                                maxLength={10}
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {verifying && <Loader2 className="w-5 h-5 text-[#641AE4] animate-spin" />}
                                {verified && accountName && <CheckCircle className="w-5 h-5 text-[#C8F55A]" />}
                                {verificationError && !verifying && <AlertCircle className="w-5 h-5 text-red-400" />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Account Name Display / Status */}
                        <AnimatePresence mode="wait">
                          {accountName && verified ? (
                            <motion.div
                              key="verified"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-5 bg-[#C8F55A]/5 border border-[#C8F55A]/20 rounded-2xl flex items-center gap-4"
                            >
                              <div className="w-12 h-12 rounded-xl bg-[#C8F55A] flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-[#1E1E2B]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#C8F55A] uppercase tracking-widest mb-1">Receiver Name</p>
                                <p className="text-xl font-bold text-[#F0F0F0] truncate">{accountName}</p>
                              </div>
                            </motion.div>
                          ) : verificationError && !verifying ? (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4"
                            >
                              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Validation Error</p>
                                <p className="text-sm text-red-200/80">{verificationError}</p>
                              </div>
                            </motion.div>
                          ) : verifying ? (
                            <motion.div
                              key="verifying"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-5 bg-[#641AE4]/5 border border-[#641AE4]/20 rounded-2xl flex items-center gap-4"
                            >
                              <div className="w-12 h-12 rounded-xl bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-6 h-6 text-[#641AE4] animate-spin" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-[#641AE4] uppercase tracking-widest mb-1">Verifying...</p>
                                <p className="text-sm text-[#B0B0B8]">Looking up account details via Nomba Bank</p>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-amber-300 font-medium mb-1">Confirm Payout Details</p>
                          <p className="text-xs text-amber-200/70">
                            Please review all details carefully before proceeding
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-[#2D2D3D]/50 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#808090]">Trade ID</span>
                          <span className="text-sm font-mono font-medium text-[#F0F0F0]">{trade.transactionId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#808090]">Client</span>
                          <span className="text-sm font-medium text-[#F0F0F0]">{trade.client?.fullName || trade.clientName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#3D3D4D]">
                          <span className="text-sm text-[#808090]">Amount</span>
                          <span className="text-lg font-bold text-[#C8F55A]">₦{parseFloat(amount).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-6 bg-[#2D2D3D]/50 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#808090]">Bank</span>
                          <span className="text-sm font-medium text-[#F0F0F0]">{selectedBank?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#808090]">Account Number</span>
                          <span className="text-sm font-mono font-medium text-[#F0F0F0]">{accountNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#808090]">Account Name</span>
                          <span className="text-sm font-medium text-[#C8F55A]">{accountName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Processing */}
                {step === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Loader2 className="w-16 h-16 text-[#641AE4] animate-spin mb-6" />
                    <h4 className="text-lg font-semibold text-[#F0F0F0] mb-2">Processing Payout...</h4>
                    <p className="text-sm text-[#808090] text-center max-w-md">
                      Please wait while we process the payout. This may take a few moments.
                    </p>
                  </motion.div>
                )}

                {/* Step 6: Success */}
                {step === "success" && payoutResult && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-[#F0F0F0] mb-2">Payout Successful!</h4>
                    <p className="text-sm text-[#808090] text-center max-w-md mb-6">
                      {payoutResult.message}
                    </p>
                    <div className="w-full max-w-md p-6 bg-[#2D2D3D]/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#808090]">Reference</span>
                        <span className="text-sm font-mono font-medium text-[#F0F0F0]">{payoutResult.payoutReference}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#808090]">Amount</span>
                        <span className="text-sm font-bold text-[#C8F55A]">₦{payoutResult.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#808090]">Status</span>
                        <span className="text-sm font-medium text-green-400">{payoutResult.status}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step !== "processing" && step !== "success" && (
              <div className="p-6 border-t border-[#2D2D3D] flex gap-3">
                {step !== "amount" && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={step === "confirm" ? handleSubmitPayout : handleNext}
                  disabled={
                    (step === "bank" && !useUserBank && (!verified || !accountName))
                  }
                  className="flex-1 py-3 rounded-lg font-semibold bg-[#C8F55A] text-[#1E1E2B] hover:bg-[#B8E54A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {step === "confirm" ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Initiate Payout
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
