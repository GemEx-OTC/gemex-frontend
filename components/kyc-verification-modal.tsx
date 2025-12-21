"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, CheckCircle, AlertCircle, Shield } from "lucide-react"

interface KycVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

type KycStep = "intro" | "upload" | "processing" | "success"

export function KycVerificationModal({ isOpen, onClose, onComplete }: KycVerificationModalProps) {
  const [step, setStep] = useState<KycStep>("intro")
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }
      setIdFile(file)
      setError("")
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!idFile) {
      setError("Please upload your ID document")
      return
    }

    setStep("processing")
    setLoading(true)

    // Simulate verification process
    setTimeout(() => {
      setLoading(false)
      setStep("success")
    }, 3000)
  }

  const handleComplete = () => {
    onComplete()
    // Reset state
    setStep("intro")
    setIdFile(null)
    setIdPreview(null)
    setError("")
  }

  const handleClose = () => {
    if (step !== "processing") {
      onClose()
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            {step !== "processing" && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D] rounded-lg transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* Intro Step */}
              {step === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#641AE4] to-[#9A24D2] rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Verify Your Identity</h2>
                    <p className="text-[#B0B0B8]">
                      Complete KYC verification to unlock full trading features and higher limits.
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-4 bg-[#2D2D3D]/30 rounded-lg">
                      <Upload className="w-5 h-5 text-[#641AE4] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#F0F0F0]">Upload ID Document</p>
                        <p className="text-xs text-[#B0B0B8]">NIN slip, National ID, Driver's License, or International Passport</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => setStep("upload")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
                  >
                    Start Verification
                  </motion.button>

                  <button
                    onClick={handleClose}
                    className="w-full mt-3 py-3 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors text-sm"
                  >
                    I'll do this later
                  </button>
                </motion.div>
              )}

              {/* Upload Step */}
              {step === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#F0F0F0] mb-1">Upload ID Document</h2>
                    <p className="text-sm text-[#B0B0B8]">Upload a clear photo of your NIN slip, National ID, Driver's License, or International Passport</p>
                  </div>

                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        idPreview
                          ? "border-[#641AE4] bg-[#641AE4]/5"
                          : "border-[#2D2D3D] hover:border-[#641AE4]/50 hover:bg-[#2D2D3D]/20"
                      }`}
                    >
                      {idPreview ? (
                        <div className="space-y-3">
                          <img
                            src={idPreview}
                            alt="ID Preview"
                            className="max-h-40 mx-auto rounded-lg object-contain"
                          />
                          <p className="text-sm text-[#641AE4]">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto bg-[#2D2D3D] rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-[#B0B0B8]" />
                          </div>
                          <div>
                            <p className="text-[#F0F0F0] font-medium">Click to upload</p>
                            <p className="text-xs text-[#B0B0B8]">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    <div className="bg-[#2D2D3D]/30 rounded-lg p-4">
                      <p className="text-xs font-medium text-[#F0F0F0] mb-2">Tips for a successful upload:</p>
                      <ul className="text-xs text-[#B0B0B8] space-y-1">
                        <li>• Ensure all corners of the document are visible</li>
                        <li>• Make sure the text is clear and readable</li>
                        <li>• Avoid glare or shadows on the document</li>
                      </ul>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep("intro")}
                        className="flex-1 py-3 rounded-lg font-medium text-[#B0B0B8] border border-[#2D2D3D] hover:border-[#641AE4] hover:text-[#F0F0F0] transition-all"
                      >
                        Back
                      </button>
                      <motion.button
                        type="submit"
                        disabled={!idFile}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Processing Step */}
              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-[#2D2D3D] border-t-[#641AE4] rounded-full"
                    />
                    <div className="absolute inset-2 bg-[#1E1E2B] rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-[#641AE4]" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verifying Your Identity</h2>
                  <p className="text-[#B0B0B8]">Please wait while we verify your information...</p>
                </motion.div>
              )}

              {/* Success Step */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-[#F0F0F0] mb-2">Verification Complete!</h2>
                  <p className="text-[#B0B0B8] mb-6">
                    Your identity has been verified. You now have full access to all trading features.
                  </p>
                  <motion.button
                    onClick={handleComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all"
                  >
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
