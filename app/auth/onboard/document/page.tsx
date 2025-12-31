"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import { QoreIDVerification } from "@/components/qoreid-verification"
import { Upload, FileCheck, X, Shield, Smartphone, CheckCircle, Globe } from "lucide-react"
import { useProfile } from "@/lib/hooks/use-auth"
import * as kycApi from "@/lib/api/kyc"
import type { DocumentType } from "@/lib/api/kyc"

type VerificationMethod = "qoreid" | "manual"

export default function DocumentUploadPage() {
  const router = useRouter()
  const { data: profile } = useProfile()

  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("qoreid")
  const [showQoreIDModal, setShowQoreIDModal] = useState(false)
  const [qoreIDSuccess, setQoreIDSuccess] = useState(false)
  const [verificationId, setVerificationId] = useState<string | null>(null)

  // Manual upload state
  const [documentType, setDocumentType] = useState<DocumentType>("nin")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragActive, setDragActive] = useState<"front" | "back" | null>(null)

  const [qoreIDAvailable, setQoreIDAvailable] = useState(true)

  // Get user data from profile
  const userData = useMemo(() => {
    if (profile) {
      const nameParts = profile.fullName?.split(" ") || ["User"]
      return {
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        userId: profile.id || `user_${Date.now()}`
      }
    }
    return { firstName: "User", lastName: "", email: "", phoneNumber: "", userId: `user_${Date.now()}` }
  }, [profile])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_QOREID_CLIENT_ID
    if (!clientId) {
      setQoreIDAvailable(false)
      setVerificationMethod("manual")
    }
  }, [])

  const handleQoreIDSuccess = async (response: any) => {
    setQoreIDSuccess(true)
    setVerificationId(response.verificationId)
    setShowQoreIDModal(false)
    setTimeout(() => {
      router.push("/auth/onboard/pending")
    }, 2000)
  }

  const handleQoreIDError = (error: any) => {
    console.error("QoreID verification error:", error)
  }

  const handleDrag = useCallback((e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(side)
    else if (e.type === "dragleave") setDragActive(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    if (e.dataTransfer.files?.[0]?.type.startsWith("image/")) {
      if (side === "front") setFrontFile(e.dataTransfer.files[0])
      else setBackFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (e.target.files?.[0]) {
      if (side === "front") setFrontFile(e.target.files[0])
      else setBackFile(e.target.files[0])
    }
  }

  const removeFile = (side: "front" | "back") => {
    if (side === "front") setFrontFile(null)
    else setBackFile(null)
  }

  const handleManualSubmit = async () => {
    if (!frontFile) return
    setUploading(true)

    try {
      // In production, upload files to storage first and get URLs
      // For now, simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call backend API
      await kycApi.submitDocument({
        documentType,
        frontImageUrl: "https://storage.example.com/front.jpg", // Replace with actual upload URL
        backImageUrl: backFile ? "https://storage.example.com/back.jpg" : undefined
      })

      setUploading(false)
      setUploadSuccess(true)
      setTimeout(() => {
        router.push("/auth/onboard/pending")
      }, 1500)
    } catch (error) {
      setUploading(false)
      console.error("Upload failed:", error)
    }
  }

  const needsBackSide = documentType === "drivers_license"

  const documentOptions: { value: DocumentType; label: string; icon: string }[] = [
    { value: "nin", label: "NIN", icon: "🆔" },
    { value: "drivers_license", label: "Driver's License", icon: "🪪" },
    { value: "voters_card", label: "Voter's Card", icon: "🗳️" },
    { value: "passport", label: "Passport", icon: "🛂" }
  ]

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
            <p className="text-[#B0B0B8]">Complete identity verification to unlock full trading features.</p>
          </div>

          <AnimatePresence>
            {qoreIDSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 200 }} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verification Submitted!</h2>
                <p className="text-[#B0B0B8] mb-4">Your identity verification has been submitted successfully.</p>
                {verificationId && <p className="text-sm text-[#B0B0B8]">Reference: <span className="text-[#C8F55A] font-mono">{verificationId}</span></p>}
                <p className="text-sm text-[#B0B0B8] mt-4">Redirecting to status page...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!qoreIDSuccess && (
            <>
              {qoreIDAvailable && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Verification Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setVerificationMethod("qoreid")}
                      className={`p-4 rounded-xl border-2 transition-all ${verificationMethod === "qoreid" ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] bg-[#2D2D3D]/50 hover:border-[#641AE4]/40"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="w-6 h-6 text-[#641AE4]" />
                        <span className="font-medium text-[#F0F0F0]">Smart Verification</span>
                      </div>
                      <p className="text-xs text-[#B0B0B8] text-left">Quick & secure scan. Supports NIN, Driver's License, Voter's Card & Passport.</p>
                      <div className="mt-2"><span className="px-2 py-0.5 bg-[#C8F55A]/20 text-[#C8F55A] text-xs rounded-full">Recommended</span></div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setVerificationMethod("manual")}
                      className={`p-4 rounded-xl border-2 transition-all ${verificationMethod === "manual" ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] bg-[#2D2D3D]/50 hover:border-[#641AE4]/40"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Upload className="w-6 h-6 text-[#641AE4]" />
                        <span className="font-medium text-[#F0F0F0]">Manual Upload</span>
                      </div>
                      <p className="text-xs text-[#B0B0B8] text-left">Upload photos of your ID document manually.</p>
                    </motion.button>
                  </div>
                </div>
              )}

              {verificationMethod === "qoreid" && qoreIDAvailable && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#641AE4]/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-[#641AE4]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#F0F0F0] mb-2">Smart Identity Verification</h3>
                        <p className="text-sm text-[#B0B0B8] mb-4">Use your device camera to scan and verify your identity document instantly.</p>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-[#F0F0F0] font-medium">Supported Documents:</p>
                          <ul className="text-sm text-[#B0B0B8] space-y-1">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />NIN (National Identification Number)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />Driver's License</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />Voter's Card (PVC)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#C8F55A]" />International Passport</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowQoreIDModal(true)}
                    className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />Start Verification
                  </motion.button>
                </div>
              )}

              {verificationMethod === "manual" && (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Select Document Type</label>
                    <div className="grid grid-cols-4 gap-3">
                      {documentOptions.map((type) => (
                        <motion.button key={type.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDocumentType(type.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${documentType === type.value ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] bg-[#2D2D3D]/50 hover:border-[#641AE4]/40"}`}>
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-xs font-medium text-[#F0F0F0]">{type.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className={`grid ${needsBackSide ? "md:grid-cols-2" : "grid-cols-1"} gap-6 mb-8`}>
                    <div>
                      <label className="block text-sm font-medium text-[#F0F0F0] mb-3">{needsBackSide ? "Front Side" : "Document"} <span className="text-red-400">*</span></label>
                      <AnimatePresence mode="wait">
                        {!frontFile ? (
                          <motion.div key="dropzone-front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onDragEnter={(e) => handleDrag(e, "front")} onDragLeave={(e) => handleDrag(e, "front")} onDragOver={(e) => handleDrag(e, "front")} onDrop={(e) => handleDrop(e, "front")}
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${dragActive === "front" ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] hover:border-[#641AE4]/40"}`}>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "front")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <Upload className="w-12 h-12 text-[#641AE4] mx-auto mb-4" />
                            <p className="text-[#F0F0F0] font-medium mb-2">Drop your file here or click to browse</p>
                            <p className="text-sm text-[#B0B0B8]">PNG, JPG up to 10MB</p>
                          </motion.div>
                        ) : (
                          <motion.div key="preview-front" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative border-2 border-[#C8F55A] bg-[#C8F55A]/10 rounded-lg p-6">
                            <button onClick={() => removeFile("front")} className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"><X className="w-4 h-4 text-red-400" /></button>
                            <FileCheck className="w-12 h-12 text-[#C8F55A] mx-auto mb-3" />
                            <p className="text-[#F0F0F0] font-medium text-center truncate">{frontFile.name}</p>
                            <p className="text-sm text-[#B0B0B8] text-center mt-1">{(frontFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {needsBackSide && (
                      <div>
                        <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Back Side <span className="text-red-400">*</span></label>
                        <AnimatePresence mode="wait">
                          {!backFile ? (
                            <motion.div key="dropzone-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              onDragEnter={(e) => handleDrag(e, "back")} onDragLeave={(e) => handleDrag(e, "back")} onDragOver={(e) => handleDrag(e, "back")} onDrop={(e) => handleDrop(e, "back")}
                              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${dragActive === "back" ? "border-[#C8F55A] bg-[#C8F55A]/10" : "border-[#2D2D3D] hover:border-[#641AE4]/40"}`}>
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "back")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Upload className="w-12 h-12 text-[#641AE4] mx-auto mb-4" />
                              <p className="text-[#F0F0F0] font-medium mb-2">Drop your file here or click to browse</p>
                              <p className="text-sm text-[#B0B0B8]">PNG, JPG up to 10MB</p>
                            </motion.div>
                          ) : (
                            <motion.div key="preview-back" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative border-2 border-[#C8F55A] bg-[#C8F55A]/10 rounded-lg p-6">
                              <button onClick={() => removeFile("back")} className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"><X className="w-4 h-4 text-red-400" /></button>
                              <FileCheck className="w-12 h-12 text-[#C8F55A] mx-auto mb-3" />
                              <p className="text-[#F0F0F0] font-medium text-center truncate">{backFile.name}</p>
                              <p className="text-sm text-[#B0B0B8] text-center mt-1">{(backFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {uploadSuccess && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-lg bg-[#C8F55A]/20 border-2 border-[#C8F55A] text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-4xl mb-2">✓</motion.div>
                        <p className="text-[#C8F55A] font-semibold">Documents uploaded successfully!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4 mb-8">
                    <p className="text-sm text-[#F0F0F0]"><strong>Tips for best results:</strong></p>
                    <ul className="text-sm text-[#B0B0B8] mt-2 space-y-1 ml-4">
                      <li>• Ensure all text is clearly readable</li>
                      <li>• Avoid glare and shadows</li>
                      <li>• Capture the entire document within the frame</li>
                    </ul>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleManualSubmit}
                    disabled={!frontFile || (needsBackSide && !backFile) || uploading}
                    className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploading ? "Uploading..." : "Submit for Verification"}
                  </motion.button>
                </>
              )}

              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.back()} disabled={uploading}
                className="w-full mt-4 px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50">
                Back
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      <QoreIDVerification isOpen={showQoreIDModal} onClose={() => setShowQoreIDModal(false)} onSuccess={handleQoreIDSuccess} onError={handleQoreIDError} />
    </div>
  )
}
