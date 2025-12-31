"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertCircle, Loader2, CheckCircle, X, CreditCard, FileText, Car, Globe } from "lucide-react"
import * as kycApi from "@/lib/api/kyc"
import type { DocumentType, QoreIdInitiateResponse } from "@/lib/api/kyc"

interface QoreIDConfig {
  clientId: string
  flowId?: string
  productCode: string
  customerReference: string
  applicantData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
  onSuccess: (response: QoreIDSuccessResponse) => void
  onClose: () => void
  onError: (error: QoreIDError) => void
}

interface QoreIDSuccessResponse {
  status: string
  verificationId: string
  data?: {
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    documentNumber?: string
    [key: string]: any
  }
}

interface QoreIDError {
  code: string
  message: string
}

interface DocumentOption {
  id: DocumentType
  label: string
  icon: React.ReactNode
  productCode: string
  description: string
}

interface QoreIDVerificationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (response: QoreIDSuccessResponse) => void
  onError?: (error: QoreIDError) => void
}

declare global {
  interface Window {
    QoreIDSDK?: {
      initialize: (config: QoreIDConfig) => void
    }
  }
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    id: "nin",
    label: "NIN (National ID)",
    icon: <FileText className="w-6 h-6" />,
    productCode: "ng_nin",
    description: "National Identification Number card or slip"
  },
  {
    id: "drivers_license",
    label: "Driver's License",
    icon: <Car className="w-6 h-6" />,
    productCode: "ng_dl",
    description: "Valid Nigerian driver's license"
  },
  {
    id: "voters_card",
    label: "Voter's Card",
    icon: <CreditCard className="w-6 h-6" />,
    productCode: "ng_vin",
    description: "Permanent Voter's Card (PVC)"
  },
  {
    id: "passport",
    label: "International Passport",
    icon: <Globe className="w-6 h-6" />,
    productCode: "ng_ip",
    description: "Nigerian International Passport"
  }
]

export function QoreIDVerification({
  isOpen,
  onClose,
  onSuccess,
  onError
}: QoreIDVerificationProps) {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null)
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [sdkConfig, setSdkConfig] = useState<QoreIdInitiateResponse | null>(null)

  // Load QoreID SDK script
  useEffect(() => {
    if (typeof window === "undefined") return

    const existingScript = document.querySelector('script[src*="qoreid"]')
    if (existingScript) {
      setSdkLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.qoreid.com/qoreid.min.js"
    script.async = true
    script.onload = () => setSdkLoaded(true)
    script.onerror = () => setError("Failed to load verification SDK")
    document.body.appendChild(script)
  }, [])

  const startVerification = useCallback(async (documentType: DocumentType) => {
    setLoading(true)
    setError(null)

    try {
      // Get SDK configuration from backend
      const config = await kycApi.initiateQoreIdVerification(documentType)
      setSdkConfig(config)

      if (!sdkLoaded || !window.QoreIDSDK) {
        setError("Verification SDK not loaded. Please refresh and try again.")
        setLoading(false)
        return
      }

      const clientId = process.env.NEXT_PUBLIC_QOREID_CLIENT_ID
      if (!clientId) {
        setError("Verification service not configured")
        setLoading(false)
        return
      }

      setVerificationStarted(true)

      window.QoreIDSDK.initialize({
        clientId,
        productCode: config.productCode,
        customerReference: config.customerReference,
        applicantData: {
          firstName: config.applicantData.firstName,
          lastName: config.applicantData.lastName,
          email: config.applicantData.email,
          phoneNumber: config.applicantData.phoneNumber
        },
        onSuccess: async (response) => {
          setLoading(false)
          setVerificationStarted(false)
          
          // Notify backend of completion
          try {
            await kycApi.completeQoreIdVerification({
              documentType,
              verificationId: response.verificationId,
              status: 'success',
              data: response.data
            })
          } catch (err) {
            console.error("Failed to notify backend:", err)
          }
          
          onSuccess(response)
        },
        onClose: () => {
          setLoading(false)
          setVerificationStarted(false)
          setSelectedDocument(null)
        },
        onError: async (err) => {
          setLoading(false)
          setVerificationStarted(false)
          setError(err.message || "Verification failed. Please try again.")
          
          // Notify backend of failure
          try {
            await kycApi.completeQoreIdVerification({
              documentType,
              verificationId: '',
              status: 'failed'
            })
          } catch (e) {
            console.error("Failed to notify backend:", e)
          }
          
          onError?.(err)
        }
      })
    } catch (err: any) {
      setLoading(false)
      setVerificationStarted(false)
      setError(err.message || "Failed to start verification. Please try again.")
    }
  }, [sdkLoaded, onSuccess, onError])

  const handleDocumentSelect = (docType: DocumentType) => {
    setSelectedDocument(docType)
    setError(null)
  }

  const handleStartVerification = () => {
    if (selectedDocument) {
      startVerification(selectedDocument)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSelectedDocument(null)
      setError(null)
      setVerificationStarted(false)
      setSdkConfig(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden"
        >
          {!loading && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D] rounded-lg transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#641AE4] to-[#9A24D2] rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">Verify Your Identity</h2>
              <p className="text-[#B0B0B8]">Select a document type to verify your identity securely</p>
            </div>

            {!sdkLoaded && !error && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#641AE4] animate-spin mb-4" />
                <p className="text-[#B0B0B8]">Loading verification service...</p>
              </div>
            )}

            {verificationStarted && loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#641AE4] animate-spin mb-4" />
                <p className="text-[#B0B0B8]">Verification in progress...</p>
                <p className="text-sm text-[#B0B0B8] mt-2">Please complete the verification in the popup</p>
              </div>
            )}

            {sdkLoaded && !verificationStarted && (
              <>
                <div className="space-y-3 mb-6">
                  {DOCUMENT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleDocumentSelect(option.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        selectedDocument === option.id
                          ? "border-[#C8F55A] bg-[#C8F55A]/10"
                          : "border-[#2D2D3D] bg-[#2D2D3D]/30 hover:border-[#641AE4]/50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedDocument === option.id
                          ? "bg-[#C8F55A]/20 text-[#C8F55A]"
                          : "bg-[#2D2D3D] text-[#B0B0B8]"
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[#F0F0F0]">{option.label}</p>
                        <p className="text-sm text-[#B0B0B8]">{option.description}</p>
                      </div>
                      {selectedDocument === option.id && (
                        <CheckCircle className="w-5 h-5 text-[#C8F55A]" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg mb-4"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartVerification}
                  disabled={!selectedDocument || loading}
                  className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    "Start Verification"
                  )}
                </motion.button>

                <button
                  onClick={handleClose}
                  className="w-full mt-3 py-3 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors text-sm"
                >
                  I'll do this later
                </button>
              </>
            )}

            <div className="mt-6 p-4 bg-[#2D2D3D]/30 rounded-lg">
              <p className="text-xs text-[#B0B0B8]">
                <strong className="text-[#F0F0F0]">🔒 Secure Verification:</strong> Your documents are processed securely by QoreID. We do not store your document images.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
