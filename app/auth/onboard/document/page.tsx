"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import { SmileIDVerification } from "@/components/smileid-verification"
import { Shield, CheckCircle } from "lucide-react"

export default function DocumentUploadPage() {
  const router = useRouter()
  const [showSmileModal, setShowSmileModal] = useState(false)
  const [smileSuccess, setSmileSuccess] = useState(false)

  const handleSmileSuccess = () => {
    setSmileSuccess(true)
    setShowSmileModal(false)
    setTimeout(() => {
      router.push("/auth/onboard/pending")
    }, 2000)
  }

  const handleSmileError = (error: any) => {
    console.error("SmileID verification error:", error)
  }

  return (
    <div className="min-h-screen bg-[#1E1E2B] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <KycProgressBar currentStep={2} totalSteps={3} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 mt-8"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Verify Your Identity</h1>
            <p className="text-[#B0B0B8]">Complete instant biometric and identity verification with SmileID to unlock full trading limits.</p>
          </div>

          <AnimatePresence>
            {smileSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200 }} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verification Submitted!</h2>
                <p className="text-[#B0B0B8] mb-4">Your identity verification has been processed successfully.</p>
                <p className="text-sm text-[#B0B0B8] mt-4">Redirecting to setup completion...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!smileSuccess && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#641AE4]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#F0F0F0] mb-2">Instant Smart Verification (Powered by SmileID)</h3>
                    <p className="text-sm text-[#B0B0B8] mb-4">Use your device camera to complete instant biometric and identity verification.</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-[#F0F0F0] font-medium">Supported Government IDs:</p>
                      <ul className="text-sm text-[#B0B0B8] space-y-1">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />NIN (National Identification Number)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />Driver&apos;s License</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />Voter&apos;s Card (PVC)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />International Passport</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSmileModal(true)}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Start Instant Verification
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/auth/onboard/wallet")}
                className="w-full mt-4 px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all"
              >
                Skip for now
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <SmileIDVerification
        isOpen={showSmileModal}
        onClose={() => setShowSmileModal(false)}
        onSuccess={handleSmileSuccess}
        onError={handleSmileError}
      />
    </div>
  )
}
