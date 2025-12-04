"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react"

export default function TradeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalStep, setApprovalStep] = useState<1 | 2>(1)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [processing, setProcessing] = useState(false)

  // Mock trade data
  const trade = {
    id: params.id,
    customer: "Chioma Okonkwo",
    email: "chioma.o@example.com",
    phone: "+234 800 123 4567",
    type: "BTC → NGN",
    cryptoAmount: "0.5 BTC",
    fiatAmount: "₦25,000,000",
    rate: "₦50,000,000/BTC",
    status: "pending_approval",
    createdAt: "2024-12-04 10:30 AM",
    walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    bankDetails: {
      accountName: "Chioma Okonkwo",
      accountNumber: "0123456789",
      bankName: "First Bank of Nigeria",
    },
  }

  const handleApprove = () => {
    setShowApprovalModal(true)
    setApprovalStep(1)
  }

  const handleStepOne = () => {
    setApprovalStep(2)
  }

  const handleFinalApproval = () => {
    if (confirmationCode !== "123456") {
      alert("Invalid confirmation code")
      return
    }

    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setShowApprovalModal(false)
      alert("Trade approved successfully!")
      router.push("/dealer/trades")
    }, 2000)
  }

  return (
    <div>
      <DashboardHeader
        title={`Trade ${trade.id}`}
        subtitle="Review and approve trade details"
        action={{
          label: "Back to Trades",
          onClick: () => router.back(),
        }}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Trade Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-6">Trade Summary</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Trade Type</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.type}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Status</label>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#641AE4]/20 text-[#641AE4]">
                  Pending Approval
                </span>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Crypto Amount</label>
                <p className="text-lg font-semibold text-[#C8F55A]">{trade.cryptoAmount}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Fiat Amount</label>
                <p className="text-lg font-semibold text-[#C8F55A]">{trade.fiatAmount}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Exchange Rate</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.rate}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Created At</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.createdAt}</p>
              </div>
            </div>
          </motion.div>

          {/* Customer Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-6">Customer Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Full Name</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.customer}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Email</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.email}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Phone</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.phone}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Wallet Address</label>
                <p className="text-sm font-mono text-[#F0F0F0] bg-[#2D2D3D] p-3 rounded break-all">
                  {trade.walletAddress}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bank Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-6">Bank Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Account Name</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.bankDetails.accountName}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Account Number</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.bankDetails.accountNumber}</p>
              </div>

              <div>
                <label className="text-sm text-[#B0B0B8] mb-1 block">Bank Name</label>
                <p className="text-lg font-semibold text-[#F0F0F0]">{trade.bankDetails.bankName}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-6 sticky top-8"
          >
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-6">Actions</h2>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
              >
                Approve Trade
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-semibold text-[#F0F0F0] border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                Reject Trade
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="w-full py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
              >
                Cancel
              </motion.button>
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#F0F0F0] font-medium mb-1">Important</p>
                  <p className="text-xs text-[#B0B0B8]">
                    Verify all details carefully before approving. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Two-Step Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !processing && setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1E2B] border-2 border-[#641AE4] rounded-2xl p-8 max-w-md w-full"
            >
              {approvalStep === 1 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#641AE4]/20 mb-4">
                      <AlertTriangle className="w-8 h-8 text-[#641AE4]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Confirm Trade Approval</h3>
                    <p className="text-[#B0B0B8]">
                      You are about to approve a trade for <strong className="text-[#C8F55A]">{trade.fiatAmount}</strong>
                    </p>
                  </div>

                  <div className="bg-[#2D2D3D]/50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Customer:</span>
                      <span className="text-[#F0F0F0] font-medium">{trade.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Amount:</span>
                      <span className="text-[#C8F55A] font-bold">{trade.cryptoAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#B0B0B8]">Payout:</span>
                      <span className="text-[#C8F55A] font-bold">{trade.fiatAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStepOne}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all"
                    >
                      Continue
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8F55A]/20 mb-4">
                      <CheckCircle className="w-8 h-8 text-[#C8F55A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">Final Confirmation</h3>
                    <p className="text-[#B0B0B8]">Enter your 2FA code to complete the approval</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-2">Confirmation Code</label>
                    <input
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full bg-[#2D2D3D] border-b-2 border-b-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] text-center text-2xl font-mono tracking-widest px-4 py-3 rounded transition-all focus:outline-none"
                    />
                    <p className="text-xs text-[#B0B0B8] mt-2 text-center">Demo code: 123456</p>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setApprovalStep(1)}
                      disabled={processing}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFinalApproval}
                      disabled={processing || confirmationCode.length !== 6}
                      className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? "Processing..." : "Approve Trade"}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
