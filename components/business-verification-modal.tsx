import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, X, Check, Loader2, Upload, Info, Clock } from "lucide-react"
import { useVerifyCac } from "@/lib/hooks/use-user-settings"
import { getKycStatus } from "@/lib/api/user-settings"
import { CategorySelector } from "@/components/category-selector"
import { BUSINESS_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"

interface BusinessVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function BusinessVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: BusinessVerificationModalProps) {
  const verifyCacMutation = useVerifyCac()
  const [rcNumber, setRcNumber] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [cacDocument, setCacDocument] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [pollMessage, setPollMessage] = useState("Authenticating with CAC Registry...")
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const pollCount = useRef(0)
  const MAX_POLLS = 20 // 20 * 3s = 60s total

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [])

  const startPolling = (jobId: string) => {
    setIsPolling(true)
    pollCount.current = 0
    
    pollingInterval.current = setInterval(async () => {
      pollCount.current += 1
      
      if (pollCount.current > 5) setPollMessage("Verification taking longer than usual...")
      if (pollCount.current > 12) setPollMessage("Still processing. Please stay with us...")

      try {
        const result = await getKycStatus(jobId)
        
        if (result.status === "success") {
          if (pollingInterval.current) clearInterval(pollingInterval.current)
          toast.success("Business verified successfully! 🎉", { description: "Upgraded to Tier 3" })
          onVerified()
          onClose()
        } else if (result.status === "failed") {
          if (pollingInterval.current) clearInterval(pollingInterval.current)
          setIsPolling(false)
          setIsSubmitting(false)
          toast.error(result.message || "Verification failed")
        }
      } catch (error) {
        console.error("Polling error:", error)
      }

      if (pollCount.current >= MAX_POLLS) {
        if (pollingInterval.current) clearInterval(pollingInterval.current)
        setIsPolling(false)
        setIsSubmitting(false)
        toast.error("Verification timed out. We will update your status once CAC responds.")
        onClose()
      }
    }, 3000)
  }

  const SMILE_ID_REGEX = /^0{7}$|^(?![0]+$)[A-Z0-9]{1,8}$/i;

  const handleVerifyCac = () => {
    const normalizedInput = rcNumber.trim().toUpperCase()
    const numericPart = normalizedInput.replace(/^(RC|BN)/, "")

    if (!normalizedInput.startsWith("RC") && !normalizedInput.startsWith("BN")) {
      toast.error("Invalid Business Number", { description: "Must start with 'RC' or 'BN'" })
      return
    }

    if (!SMILE_ID_REGEX.test(numericPart)) {
      toast.error("Unsupported ID number format", { description: "Please ensure you are using a valid RC or BN number." })
      return
    }

    if (!businessAddress || !businessCategory) {
      toast.error("Required fields", { description: "Please provide Business Address and Category for Tier 3 verification" })
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("rcNumber", normalizedInput)
    formData.append("businessAddress", businessAddress)
    formData.append("businessCategory", businessCategory)
    if (cacDocument) {
      formData.append("document", cacDocument)
    }

    verifyCacMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.status === "success") {
          toast.success("Business verified successfully! ✓", { description: "Upgraded to Tier 3" })
          onVerified()
          onClose()
        } else {
          // It's pending, start polling
          startPolling(data.jobId)
        }
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to submit verification")
        setIsSubmitting(false)
      }
    })
  }

  if (!isOpen) return null

  const handleInputChange = (val: string) => {
    let formatted = val.toUpperCase()
    // Auto-prepend RC if user starts with a number
    if (/^\d/.test(formatted)) {
      formatted = "RC" + formatted
    }
    setRcNumber(formatted)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSubmitting ? onClose : undefined}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden"
        >
          {isPolling ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-t-2 border-r-2 border-[#641AE4]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#C8F55A]" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#F0F0F0]">Verifying Business</h3>
                <p className="text-[#B0B0B8] text-sm max-w-[280px]">{pollMessage}</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-xs text-[#B0B0B8]">
                <Clock className="w-3 h-3 text-[#C8F55A]" />
                <span>Average time: 15-30 seconds</span>
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-[#2D2D3D]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#641AE4]/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#C8F55A]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#F0F0F0]">Business Verification</h2>
                      <p className="text-sm text-[#B0B0B8]">Tier 3 Verification (CAC)</p>
                    </div>
                  </div>
                  {!isSubmitting && (
                    <button onClick={onClose} className="p-2 hover:bg-[#2D2D3D] rounded-lg transition-colors">
                      <X className="w-5 h-5 text-[#B0B0B8]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3 bg-[#641AE4]/5 border border-[#641AE4]/10 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-[#C8F55A] shrink-0" />
                  <p className="text-xs text-[#B0B0B8] leading-relaxed">
                    Enter your business details exactly as they appear on your CAC documents. Verification usually takes 15-60 seconds.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-[#B0B0B8] mb-2">RC / BN Number</label>
                    <input
                      type="text"
                      value={rcNumber}
                      disabled={isSubmitting}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="RC1234567"
                      className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-[#B0B0B8] mb-2">Business Category</label>
                    <CategorySelector
                      value={businessCategory}
                      onChange={setBusinessCategory}
                      categories={BUSINESS_CATEGORIES}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B0B0B8] mb-2">Registered Business Address</label>
                  <textarea
                    value={businessAddress}
                    disabled={isSubmitting}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    rows={2}
                    placeholder="E.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                    className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B0B0B8] mb-2">CAC Document (Optional PDF/PNG/JPG)</label>
                  <div className={`relative border-2 border-dashed ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'border-[#2D2D3D] hover:border-[#641AE4]/50 cursor-pointer'} rounded-xl p-6 transition-colors text-center bg-[#2D2D3D]/30`}>
                    <input 
                      type="file" 
                      disabled={isSubmitting}
                      accept=".pdf,image/*"
                      onChange={(e) => setCacDocument(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-[#2D2D3D] flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[#B0B0B8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F0F0F0]">
                          {cacDocument ? cacDocument.name : "Click to upload CAC Document"}
                        </p>
                        <p className="text-xs text-[#B0B0B8]">
                          PNG, JPG or PDF (max. 20MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    onClick={handleVerifyCac}
                    disabled={isSubmitting || !rcNumber || !businessCategory}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-[#C8F55A] hover:bg-[#C8F55A]/90 text-[#1E1E2B] rounded-xl flex items-center justify-center gap-2 h-12 disabled:opacity-50 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting Verification...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Submit for Verification
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
