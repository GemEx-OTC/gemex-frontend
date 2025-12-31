"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useChangePassword, useProfile, useVerifyPassword } from "@/lib/hooks/use-user-settings"
import { OtpVerificationModal } from "./otp-verification-modal"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
]

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const { data: profile } = useProfile()
  const changePasswordMutation = useChangePassword()
  const verifyPasswordMutation = useVerifyPassword()

  const allRequirementsMet = passwordRequirements.every((req) => req.test(form.newPassword))
  const passwordsMatch = form.newPassword === form.confirmPassword && form.confirmPassword.length > 0
  const twoFactorEnabled = profile?.twoFactorEnabled || false

  const validateForm = () => {
    if (!form.currentPassword) {
      toast.error("Current password required", {
        description: "Please enter your current password to continue.",
      })
      return false
    }
    if (!allRequirementsMet) {
      toast.error("Password too weak", {
        description: "Your new password doesn't meet all the security requirements.",
      })
      return false
    }
    if (!passwordsMatch) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match.",
      })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // If 2FA is enabled, first verify current password, then show OTP modal
    if (twoFactorEnabled) {
      verifyPasswordMutation.mutate(
        { password: form.currentPassword },
        {
          onSuccess: () => {
            // Password is correct, now show OTP modal
            setShowOtpModal(true)
          },
          onError: () => {
            toast.error("Incorrect current password", {
              description: "The current password you entered is wrong. Please try again.",
            })
          },
        }
      )
      return
    }

    // Otherwise, proceed directly
    performPasswordChange()
  }

  const performPasswordChange = () => {
    changePasswordMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Password updated! 🔐", {
          description: "Your password has been changed successfully.",
        })
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      },
      onError: (error: any) => {
        const message = error?.message || "Failed to update password"
        if (message.toLowerCase().includes("incorrect") || message.toLowerCase().includes("invalid")) {
          toast.error("Incorrect current password", {
            description: "The current password you entered is wrong. Please try again.",
          })
        } else {
          toast.error("Password update failed", { description: message })
        }
      },
    })
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    performPasswordChange()
  }

  const isLoading = changePasswordMutation.isPending || verifyPasswordMutation.isPending

  return (
    <>
      <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#641AE4]/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#641AE4]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F0F0F0]">Change Password</h3>
            <p className="text-sm text-[#B0B0B8]">Update your password to keep your account secure</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 pr-12 rounded transition-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-[#B0B0B8] mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Create a strong password"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 pr-12 rounded transition-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {form.newPassword.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 bg-[#2D2D3D]/50 rounded-lg">
                <p className="text-xs font-medium text-[#B0B0B8] mb-2">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req, idx) => {
                    const met = req.test(form.newPassword)
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {met ? <CheckCircle className="w-3.5 h-3.5 text-[#C8F55A]" /> : <AlertCircle className="w-3.5 h-3.5 text-[#B0B0B8]" />}
                        <span className={`text-xs ${met ? "text-[#C8F55A]" : "text-[#B0B0B8]"}`}>{req.label}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm your new password"
                className={`w-full bg-[#2D2D3D] border-b-2 transition-all text-[#F0F0F0] px-4 py-3 pr-12 rounded focus:outline-none ${
                  form.confirmPassword.length > 0 ? (passwordsMatch ? "border-b-[#C8F55A]" : "border-b-red-500") : "border-transparent focus:border-b-[#C8F55A]"
                }`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B8] hover:text-[#F0F0F0] transition-colors">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.confirmPassword.length > 0 && !passwordsMatch && <p className="text-xs text-red-400 mt-2">Passwords don't match</p>}
            {passwordsMatch && <p className="text-xs text-[#C8F55A] mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>}
          </div>
        </div>

        {/* 2FA Notice */}
        {twoFactorEnabled && (
          <div className="mt-4 p-3 bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg">
            <p className="text-xs text-[#B0B0B8]"><span className="text-[#641AE4] font-medium">🔐 2FA Enabled:</span> You'll need to verify via email OTP after confirming your current password.</p>
          </div>
        )}

        <motion.button
          onClick={handleSubmit}
          disabled={isLoading || !form.currentPassword || !allRequirementsMet || !passwordsMatch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-[#1E1E2B]/30 border-t-[#1E1E2B] rounded-full animate-spin" />{verifyPasswordMutation.isPending ? "Verifying..." : "Updating..."}</>
          ) : (
            <><Lock className="w-4 h-4" />Update Password</>
          )}
        </motion.button>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        title="Verify Password Change"
        description="For your security, please verify this action"
        email={profile?.email || ""}
        actionType="password"
      />
    </>
  )
}
