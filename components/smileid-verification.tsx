"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertCircle, Loader2, X, CheckCircle } from "lucide-react"
import * as kycApi from "@/lib/api/kyc"
import { useProfile } from "@/lib/hooks/use-auth"
import type { SmileIdentityConfig } from "@/lib/api/types"

interface SmileIDVerificationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: any) => void
  onError?: (error: any) => void
  product?: 'biometric_kyc' | 'doc_verification' | 'enhanced_document_verification'
  title?: string
  description?: string
}

export function SmileIDVerification({
  isOpen,
  onClose,
  onSuccess,
  onError,
  product = 'biometric_kyc',
  title = "Verify Your Identity",
  description = "Complete secure identity verification using SmileID"
}: SmileIDVerificationProps) {
  const { data: profile } = useProfile()
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load SmileID script tag (v12)
  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.SmileIdentity || document.querySelector('script[src*="usesmileid.com"]')) {
      setSdkLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.usesmileid.com/inline/v12/js/script.min.js"
    script.async = true
    script.onload = () => {
      setSdkLoaded(true)
    }
    script.onerror = () => {
      setError("Failed to load SmileID verification SDK. Please check your network.")
    }
    document.body.appendChild(script)
  }, [])

  const startVerification = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!window.SmileIdentity) {
        throw new Error("SmileID SDK is not ready yet. Please wait a moment.")
      }

      // Step 1: Mint backend v3 token
      const tokenData = await kycApi.getSmileIdToken(product)

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

      const config: SmileIdentityConfig = {
        token: tokenData.token,
        product,
        callback_url: tokenData.callback_url,
        environment: tokenData.environment || 'sandbox',
        partner_details: {
          partner_id: tokenData.partner_id || '8428',
          name: 'GemOTC',
          logo_url: 'https://gemotc.com/icons/logo.png',
          policy_url: 'https://gemotc.com/privacy',
          theme_color: '#641AE4',
        },
        consent_information: {
          granted: true,
          granted_at: new Date().toISOString(),
        },
        user_details: {
          given_names: givenNames,
          last_name: lastName,
          email: profile?.email || undefined,
          phone_number: formattedPhone || undefined,
        },
        id_selection: product === 'doc_verification'
          ? { NG: ['PASSPORT', 'DRIVERS_LICENSE', 'IDENTITY_CARD', 'VOTER_ID'] }
          : { NG: ['NIN_V2', 'NATIONAL_ID', 'BVN', 'BVN_MFA', 'VOTER_ID'] },
        use_strict_mode: false,
        onResult: (result) => {
          setLoading(false)
          if (result.status === 'success') {
            onSuccess(result)
            onClose()
          } else if (result.status === 'failure') {
            const errMsg = result.error?.message || result.error?.error_code || 'Verification could not be completed.'
            setError(errMsg)
            onError?.(result.error)
          } else if (result.status === 'cancelled') {
            onClose()
          }
        },
        onClose: () => {
          setLoading(false)
          onClose()
        },
        onError: (err: any) => {
          setLoading(false)
          const msg = typeof err === 'string' ? err : err?.message || 'Verification failed.'
          setError(msg)
          onError?.(err)
        }
      }

      window.SmileIdentity(config)
    } catch (err: any) {
      setLoading(false)
      const msg = err?.response?.data?.message || err?.message || "Failed to initialize verification session"
      setError(msg)
      onError?.(err)
    }
  }, [profile, product, onSuccess, onError, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#1E1E2B] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden p-6 z-10"
        >
          {!loading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D] rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#641AE4] to-[#9A24D2] rounded-full flex items-center justify-center shadow-lg shadow-[#641AE4]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#F0F0F0] mb-2">{title}</h2>
            <p className="text-[#B0B0B8] text-sm">{description}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-6"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="bg-[#2D2D3D]/40 border border-[#641AE4]/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-4 h-4 text-[#C8F55A]" />
              <span className="text-sm font-medium text-[#F0F0F0]">Instant ID Verification</span>
            </div>
            <p className="text-xs text-[#B0B0B8] ml-7">
              Verifies directly with national identity authorities. Supports NIN, Driver&apos;s License, Voter&apos;s Card, and International Passport.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startVerification}
            disabled={loading || !sdkLoaded}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#641AE4] to-[#9A24D2] hover:shadow-lg hover:shadow-[#641AE4]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing Verification...</span>
              </>
            ) : !sdkLoaded ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading SDK...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Launch Verification Flow</span>
              </>
            )}
          </motion.button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full mt-3 py-3 text-sm text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors disabled:opacity-50"
          >
            I&apos;ll do this later
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
