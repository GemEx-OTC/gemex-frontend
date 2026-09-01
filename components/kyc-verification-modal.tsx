"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Shield, FileText, Car, CreditCard, Loader2, Globe } from "lucide-react"
import * as kycApi from "@/lib/api/kyc"
import { useProfile } from "@/lib/hooks/use-auth"
import type { SmileIdentityConfig } from "@/lib/api/types"

interface KycVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type KycStep = "intro" | "select-document" | "processing" | "success"

interface DocumentOption {
  id: string
  label: string
  icon: React.ReactNode
  smileIdType: string
  description: string
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  { id: "nin", label: "NIN (National ID)", icon: <FileText className="w-6 h-6" />, smileIdType: "NIN", description: "National Identification Number slip or card" },
  { id: "drivers_license", label: "Driver's License", icon: <Car className="w-6 h-6" />, smileIdType: "DRIVERS_LICENSE", description: "Valid Nigerian driver's license" },
  { id: "voters_card", label: "Voter's Card", icon: <CreditCard className="w-6 h-6" />, smileIdType: "VOTERS_CARD", description: "Permanent Voter's Card (PVC)" },
  { id: "passport", label: "International Passport", icon: <Globe className="w-6 h-6" />, smileIdType: "PASSPORT", description: "Nigerian International Passport" }
]

export function KycVerificationModal({ isOpen, onClose, onComplete }: KycVerificationModalProps) {
  const { data: profile } = useProfile()
  const [step, setStep] = useState<KycStep>("intro")
  const [selectedDocument, setSelectedDocument] = useState<string>("nin")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)

  // Load SmileID v12 Web SDK
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.SmileIdentity || document.querySelector('script[src*="usesmileid.com"]')) {
      setSdkLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.usesmileid.com/inline/v12/js/script.min.js"
    script.async = true
    script.onload = () => setSdkLoaded(true)
    script.onerror = () => setError("Failed to load identity verification service.")
    document.body.appendChild(script)
  }, [])

  const startSmileIDVerification = useCallback(async (docType: string = "nin") => {
    setLoading(true)
    setError("")

    try {
      if (!window.SmileIdentity) {
        throw new Error("SmileID SDK is not ready yet. Please wait a moment.")
      }

      // Mint backend v3 token
      const tokenData = await kycApi.getSmileIdToken("biometric_kyc")

      const nameParts = profile?.fullName?.trim().split(" ") || ["User"]
      const givenNames = nameParts[0] || "User"
      const lastName = nameParts.slice(1).join(" ") || "Customer"

      // Format E.164 phone
      let formattedPhone = profile?.phoneNumber || ""
      if (formattedPhone && !formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("234")) {
          formattedPhone = `+${formattedPhone}`
        } else if (formattedPhone.startsWith("0")) {
          formattedPhone = `+234${formattedPhone.substring(1)}`
        } else {
          formattedPhone = `+234${formattedPhone}`
        }
      }

      const selectedDoc = DOCUMENT_OPTIONS.find(d => d.id === docType)
      const idSelectionType = selectedDoc?.smileIdType || "NIN"

      const config: SmileIdentityConfig = {
        token: tokenData.token,
        product: "biometric_kyc",
        callback_url: tokenData.callback_url,
        environment: tokenData.environment || "sandbox",
        partner_details: {
          partner_id: tokenData.partner_id || "8428",
          name: "GemOTC",
          logo_url: "https://gemotc.com/icons/logo.png",
          policy_url: "https://gemotc.com/privacy",
          theme_color: "#641AE4",
        },
        user_details: {
          given_names: givenNames,
          last_name: lastName,
          email: profile?.email || undefined,
          phone_number: formattedPhone || undefined,
        },
        id_selection: {
          NG: [idSelectionType],
        },
        use_strict_mode: false,
        onResult: (result) => {
          setLoading(false)
          if (result.status === "success") {
            setStep("success")
          } else if (result.status === "failure") {
            const errMsg = result.error?.message || result.error?.error_code || "Verification could not be completed."
            setError(errMsg)
            setStep("select-document")
          } else if (result.status === "cancelled") {
            setStep("select-document")
          }
        },
        onClose: () => {
          setLoading(false)
          setStep("select-document")
        },
        onError: (err: any) => {
          setLoading(false)
          const msg = typeof err === "string" ? err : err?.message || "Verification failed."
          setError(msg)
          setStep("select-document")
        }
      }

      window.SmileIdentity(config)
    } catch (err: any) {
      setLoading(false)
      const msg = err?.response?.data?.message || err?.message || "Failed to initialize verification session"
      setError(msg)
      setStep("select-document")
    }
  }, [profile])

  const handleComplete = () => {
    onComplete()
    setStep("intro")
    setError("")
  }

  const handleClose = () => {
    if (step !== "processing") onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden">
            {step !== "processing" && (
              <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D] rounded-lg transition-all z-10">
                <X className="w-5 h-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === "intro" && (
                <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#641AE4] to-[#9A24D2] rounded-full flex items-center justify-center shadow-lg shadow-[#641AE4]/20">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Verify Your Identity</h2>
                    <p className="text-[#B0B0B8]">Complete instant biometric KYC to unlock Tier 2 ($50,000) trading limits.</p>
                  </div>
                  <motion.button onClick={() => setStep("select-document")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all">
                    Start Verification
                  </motion.button>
                  <button onClick={handleClose} className="w-full mt-3 py-3 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors text-sm">I&apos;ll do this later</button>
                </motion.div>
              )}

              {step === "select-document" && (
                <motion.div key="select-document" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Select Document Type</h2>
                    <p className="text-sm text-[#B0B0B8]">Choose the document you want to verify with</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {DOCUMENT_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { setSelectedDocument(option.id); setError("") }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedDocument === option.id ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] bg-[#2D2D3D]/30 hover:border-[#641AE4]/50"}`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedDocument === option.id ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-[#2D2D3D] text-[#B0B0B8]"}`}>{option.icon}</div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[#F0F0F0]">{option.label}</p>
                          <p className="text-sm text-[#B0B0B8]">{option.description}</p>
                        </div>
                        {selectedDocument === option.id && <CheckCircle className="w-5 h-5 text-[#C8F55A]" />}
                      </motion.button>
                    ))}
                  </div>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setStep("intro")} className="flex-1 py-3 rounded-lg font-medium text-[#B0B0B8] border border-[#2D2D3D] hover:border-[#641AE4] hover:text-[#F0F0F0] transition-all">Back</button>
                    <motion.button
                      onClick={() => startSmileIDVerification(selectedDocument)}
                      disabled={!selectedDocument || loading || !sdkLoaded}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Starting...</span>
                        </>
                      ) : !sdkLoaded ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading SDK...</span>
                        </>
                      ) : (
                        "Continue"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-[#2D2D3D] border-t-[#641AE4] rounded-full" />
                    <div className="absolute inset-2 bg-[#1E1E2B] rounded-full flex items-center justify-center"><Shield className="w-8 h-8 text-[#641AE4]" /></div>
                  </div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verifying Your Identity</h2>
                  <p className="text-[#B0B0B8]">Please wait while we verify your information with SmileID...</p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verification Submitted!</h2>
                  <p className="text-[#B0B0B8] mb-6">Your identity has been submitted. Your dashboard and limits will update automatically upon confirmation.</p>
                  <motion.button onClick={handleComplete} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all">
                    Continue to Dashboard
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
