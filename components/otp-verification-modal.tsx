"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, Shield, Loader2, X, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useSendOtp, useVerifyOtp, useSendPhoneOtp, useVerifyPhoneOtp } from "@/lib/hooks/use-user-settings"

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: (otp?: string) => void
  title: string
  description: string
  email: string
  phoneNumber?: string
  actionType: "password" | "bank_account" | "phone_number" | "quote_rates" | "exchange_rates" | "phone_verification"
  showPhoneInput?: boolean
  onPhoneSubmit?: (phone: string) => void
  initialOtpSent?: boolean
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  onVerified,
  title,
  description,
  email,
  phoneNumber,
  actionType,
  showPhoneInput = false,
  onPhoneSubmit,
  initialOtpSent = false,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [phoneValue, setPhoneValue] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const sendPhoneOtpMutation = useSendPhoneOtp()
  const verifyPhoneOtpMutation = useVerifyPhoneOtp()

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""])
      setError("")
      setOtpSent(initialOtpSent)
      setCountdown(initialOtpSent ? 120 : 0)
      setPhoneValue(phoneNumber || "")
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = (phoneToUse?: string) => {
    const targetPhone = phoneToUse || phoneValue || phoneNumber

    if (actionType === "phone_verification") {
      if (!targetPhone) {
        toast.error("Phone number required")
        return
      }

      // Normalize to international format without double-prefixing:
      // - "+2349164..." → keep as-is
      // - "2349164..."  → already has country code, just add +
      // - "09164..."    → local format, replace leading 0 with +234
      // - "9164..."     → bare number, prepend +234
      let formattedPhone = targetPhone.replace(/\s+/g, '')
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('234')) {
          formattedPhone = '+' + formattedPhone
        } else if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
          formattedPhone = '+234' + formattedPhone.substring(1)
        } else {
          formattedPhone = '+234' + formattedPhone.replace(/^0/, '')
        }
      }

      sendPhoneOtpMutation.mutate(
        formattedPhone,
        {
          onSuccess: () => {
            setOtpSent(true)
            setCountdown(120)
            toast.success("OTP sent! 📱", {
              description: `Check your phone at ${maskPhone(formattedPhone)}`,
            })
            if (onPhoneSubmit) onPhoneSubmit(formattedPhone)
            setTimeout(() => inputRefs.current[0]?.focus(), 100)
          },
          onError: (err: any) => {
            if (err.response?.data?.error?.code === 'TOO_MANY_REQUESTS') {
              setCountdown(120) // Sync with backend rate limit
            }
            toast.error("Failed to send OTP", { description: err.message || "Please try again later." })
          },
        }
      )
      return
    }

    sendOtpMutation.mutate(
      { actionType },
      {
        onSuccess: () => {
          setOtpSent(true)
          setCountdown(120)
          toast.success("OTP sent! 📧", {
            description: `Check your email at ${maskEmail(email)}`,
          })
          // Focus first input
          setTimeout(() => inputRefs.current[0]?.focus(), 100)
        },
        onError: () => {
          toast.error("Failed to send OTP", {
            description: "Please try again later.",
          })
        },
      }
    )
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      handleVerifyOtp(pastedData)
    }
  }

  const handleVerifyOtp = (code: string) => {
    if (actionType === "phone_verification") {
      const targetPhone = phoneValue || phoneNumber || ""
      verifyPhoneOtpMutation.mutate(
        { phoneNumber: targetPhone, otp: code },
        {
          onSuccess: () => {
            toast.success("Phone verified! ✓")
            onVerified(code)
          },
          onError: (err: any) => {
            setError(err.message || "Invalid or expired code. Please try again.")
            setOtp(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
          },
        }
      )
      return
    }

    verifyOtpMutation.mutate(
      { code, actionType },
      {
        onSuccess: () => {
          toast.success("Verified! ✓", {
            description: "You can now proceed with the change.",
          })
          onVerified(code)
        },
        onError: () => {
          setError("Invalid or expired code. Please try again.")
          setOtp(["", "", "", "", "", ""])
          inputRefs.current[0]?.focus()
        },
      }
    )
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@")
    if (!local || !domain) return email
    if (local.length <= 2) return email
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
  }

  const maskPhone = (phone: string) => {
    if (!phone) return ""
    if (phone.length <= 4) return phone
    return `${phone.slice(0, 3)}${"*".repeat(phone.length - 7)}${phone.slice(-4)}`
  }

  const isPhone = actionType === "phone_verification"

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => !verifyOtpMutation.isPending && !sendOtpMutation.isPending && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1E1E2B] border-2 border-[#641AE4] rounded-2xl p-8 max-w-md w-full relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={verifyOtpMutation.isPending || sendOtpMutation.isPending}
            className="absolute top-4 right-4 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#641AE4]/20 mb-4">
              <Shield className="w-8 h-8 text-[#641AE4]" />
            </div>
            <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2">{title}</h3>
            <p className="text-[#B0B0B8]">{description}</p>
          </div>

          {!otpSent ? (
            /* Send OTP Step */
              <div className="space-y-6">
                {showPhoneInput && !phoneNumber ? (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8F55A] font-bold border-r border-[#2D2D3D] pr-3 mr-3">
                        +234
                      </div>
                      <input
                        type="tel"
                        value={phoneValue.replace(/^\+234/, "")}
                        onChange={(e) => setPhoneValue(`+234${e.target.value.replace(/\D/g, "").slice(0, 10)}`)}
                        placeholder="8012345678"
                        className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] pl-20 pr-4 py-3 rounded transition-all focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-[#B0B0B8]">We'll send a 6-digit verification code to this number.</p>
                  </div>
                ) : (
                  <div className="p-4 bg-[#2D2D3D]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isPhone ? (
                        <Phone className="w-5 h-5 text-[#641AE4]" />
                      ) : (
                        <Mail className="w-5 h-5 text-[#641AE4]" />
                      )}
                      <div>
                        <p className="text-sm text-[#B0B0B8]">We'll send a code to</p>
                        <p className="font-medium text-[#F0F0F0]">
                          {isPhone ? maskPhone(phoneNumber || phoneValue) : maskEmail(email)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={() => handleSendOtp()}
                  disabled={sendOtpMutation.isPending || sendPhoneOtpMutation.isPending || (showPhoneInput && !phoneValue)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendOtpMutation.isPending || sendPhoneOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      {isPhone ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                      Send Verification Code
                    </>
                  )}
                </motion.button>
              </div>
          ) : (
            /* Enter OTP Step */
            <div className="space-y-6">
              <div className="p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/30 rounded-lg">
                <p className="text-sm text-[#C8F55A] text-center">
                  Code sent to {isPhone ? maskPhone(phoneNumber || phoneValue) : maskEmail(email)}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3 text-center">
                  Enter 6-digit code
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-mono rounded-lg bg-[#2D2D3D] border-2 transition-all focus:outline-none ${
                        error
                          ? "border-red-500"
                          : digit
                          ? "border-[#C8F55A]"
                          : "border-transparent focus:border-[#641AE4]"
                      } text-[#F0F0F0]`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
                )}
                <p className="text-xs text-[#B0B0B8] mt-3 text-center">
                  The code expires in 5 minutes
                </p>
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-[#B0B0B8]">
                    Resend code in <span className="text-[#C8F55A] font-mono">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={() => handleSendOtp()}
                    disabled={sendOtpMutation.isPending || sendPhoneOtpMutation.isPending}
                    className="text-sm text-[#641AE4] hover:text-[#C8F55A] transition-colors flex items-center gap-1 mx-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${sendOtpMutation.isPending || sendPhoneOtpMutation.isPending ? "animate-spin" : ""}`} />
                    Resend code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <motion.button
                onClick={() => handleVerifyOtp(otp.join(""))}
                disabled={verifyOtpMutation.isPending || verifyPhoneOtpMutation.isPending || otp.some((d) => !d)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyOtpMutation.isPending || verifyPhoneOtpMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
