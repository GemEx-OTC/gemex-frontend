"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, CheckCircle, AlertCircle, Shield, FileText, Car, CreditCard, Loader2, Globe } from "lucide-react"
import * as kycApi from "@/lib/api/kyc"
import type { DocumentType } from "@/lib/api/kyc"

interface KycVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type KycStep = "intro" | "select-document" | "upload" | "processing" | "success"

interface DocumentOption {
  id: DocumentType
  label: string
  icon: React.ReactNode
  productCode: string
  description: string
}

declare global {
  interface Window {
    QoreIDSDK?: {
      initialize: (config: any) => void
    }
  }
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  { id: "nin", label: "NIN (National ID)", icon: <FileText className="w-6 h-6" />, productCode: "ng_nin", description: "National Identification Number" },
  { id: "drivers_license", label: "Driver's License", icon: <Car className="w-6 h-6" />, productCode: "ng_dl", description: "Valid Nigerian driver's license" },
  { id: "voters_card", label: "Voter's Card", icon: <CreditCard className="w-6 h-6" />, productCode: "ng_vin", description: "Permanent Voter's Card (PVC)" },
  { id: "passport", label: "International Passport", icon: <Globe className="w-6 h-6" />, productCode: "ng_ip", description: "Nigerian International Passport" }
]

export function KycVerificationModal({ isOpen, onClose, onComplete }: KycVerificationModalProps) {
  const [step, setStep] = useState<KycStep>("intro")
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [qoreIDAvailable, setQoreIDAvailable] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const clientId = process.env.NEXT_PUBLIC_QOREID_CLIENT_ID
    if (!clientId) { setQoreIDAvailable(false); return }

    const existingScript = document.querySelector('script[src*="qoreid"]')
    if (existingScript) { setSdkLoaded(true); return }

    const script = document.createElement("script")
    script.src = "https://sdk.qoreid.com/qoreid.min.js"
    script.async = true
    script.onload = () => setSdkLoaded(true)
    script.onerror = () => setQoreIDAvailable(false)
    document.body.appendChild(script)
  }, [])

  const startQoreIDVerification = async () => {
    if (!sdkLoaded || !window.QoreIDSDK || !selectedDocument) {
      setError("Verification service not available")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_QOREID_CLIENT_ID
    if (!clientId) { setError("Verification service not configured"); return }

    setLoading(true)
    setError("")
    setStep("processing")

    try {
      const config = await kycApi.initiateQoreIdVerification(selectedDocument)

      window.QoreIDSDK.initialize({
        clientId,
        productCode: config.productCode,
        customerReference: config.customerReference,
        applicantData: config.applicantData,
        onSuccess: async (response: any) => {
          try {
            await kycApi.completeQoreIdVerification({
              documentType: selectedDocument,
              verificationId: response.verificationId,
              status: 'success',
              data: response.data
            })
          } catch (e) { console.error("Failed to notify backend:", e) }
          setLoading(false)
          setStep("success")
        },
        onClose: () => { setLoading(false); setStep("select-document") },
        onError: async (err: any) => {
          try {
            await kycApi.completeQoreIdVerification({ documentType: selectedDocument, verificationId: '', status: 'failed' })
          } catch (e) { console.error("Failed to notify backend:", e) }
          setLoading(false)
          setError(err.message || "Verification failed")
          setStep("select-document")
        }
      })
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to start verification")
      setStep("select-document")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB"); return }
      if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return }
      setIdFile(file)
      setError("")
      const reader = new FileReader()
      reader.onloadend = () => setIdPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!idFile || !selectedDocument) { setError("Please upload your ID document"); return }

    setStep("processing")
    setLoading(true)

    try {
      await kycApi.submitDocument({
        documentType: selectedDocument,
        frontImageUrl: "https://storage.example.com/document.jpg" // Replace with actual upload
      })
      setLoading(false)
      setStep("success")
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Upload failed")
      setStep("upload")
    }
  }

  const handleComplete = () => {
    onComplete()
    setStep("intro")
    setSelectedDocument(null)
    setIdFile(null)
    setIdPreview(null)
    setError("")
  }

  const handleClose = () => { if (step !== "processing") onClose() }

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
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#641AE4] to-[#9A24D2] rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Verify Your Identity</h2>
                    <p className="text-[#B0B0B8]">Complete KYC verification to unlock full trading features.</p>
                  </div>
                  <motion.button onClick={() => setStep("select-document")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all">
                    Start Verification
                  </motion.button>
                  <button onClick={handleClose} className="w-full mt-3 py-3 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors text-sm">I'll do this later</button>
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
                      <motion.button key={option.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => { setSelectedDocument(option.id); setError("") }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedDocument === option.id ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] bg-[#2D2D3D]/30 hover:border-[#641AE4]/50"}`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedDocument === option.id ? "bg-[#C8F55A]/20 text-[#C8F55A]" : "bg-[#2D2D3D] text-[#B0B0B8]"}`}>{option.icon}</div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-[#F0F0F0]">{option.label}</p>
                          <p className="text-sm text-[#B0B0B8]">{option.description}</p>
                        </div>
                        {selectedDocument === option.id && <CheckCircle className="w-5 h-5 text-[#C8F55A]" />}
                      </motion.button>
                    ))}
                  </div>
                  {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</motion.div>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep("intro")} className="flex-1 py-3 rounded-lg font-medium text-[#B0B0B8] border border-[#2D2D3D] hover:border-[#641AE4] hover:text-[#F0F0F0] transition-all">Back</button>
                    <motion.button onClick={() => { if (qoreIDAvailable && sdkLoaded) startQoreIDVerification(); else setStep("upload") }} disabled={!selectedDocument || loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue"}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === "upload" && (
                <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Upload ID Document</h2>
                    <p className="text-sm text-[#B0B0B8]">Upload a clear photo of your selected document</p>
                  </div>
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${idPreview ? "border-[#641AE4] bg-[#641AE4]/5" : "border-[#2D2D3D] hover:border-[#641AE4]/50 hover:bg-[#2D2D3D]/20"}`}>
                      {idPreview ? (
                        <div className="space-y-3">
                          <img src={idPreview} alt="ID Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                          <p className="text-sm text-[#641AE4]">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto bg-[#2D2D3D] rounded-full flex items-center justify-center"><Upload className="w-6 h-6 text-[#B0B0B8]" /></div>
                          <div><p className="text-[#F0F0F0] font-medium">Click to upload</p><p className="text-xs text-[#B0B0B8]">PNG, JPG up to 5MB</p></div>
                        </div>
                      )}
                    </div>
                    {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</motion.div>}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep("select-document")} className="flex-1 py-3 rounded-lg font-medium text-[#B0B0B8] border border-[#2D2D3D] hover:border-[#641AE4] hover:text-[#F0F0F0] transition-all">Back</button>
                      <motion.button type="submit" disabled={!idFile} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Submit</motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-[#2D2D3D] border-t-[#641AE4] rounded-full" />
                    <div className="absolute inset-2 bg-[#1E1E2B] rounded-full flex items-center justify-center"><Shield className="w-8 h-8 text-[#641AE4]" /></div>
                  </div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verifying Your Identity</h2>
                  <p className="text-[#B0B0B8]">Please wait while we verify your information...</p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verification Submitted!</h2>
                  <p className="text-[#B0B0B8] mb-6">Your verification is being processed. You'll be notified once complete.</p>
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
