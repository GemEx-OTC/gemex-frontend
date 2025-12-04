"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import Link from "next/link"

export default function DocumentUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    setUploading(true)
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false)
      // Proceed to wallet verification
      window.location.href = "/auth/onboard/wallet"
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="relative bg-[#1E1E2B]/80 backdrop-blur-md border border-[#641AE4]/30 rounded-xl p-8">
          <KycProgressBar currentStep={2} totalSteps={4} />

          <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Identity Document</h1>
          <p className="text-[#B0B0B8] mb-8">Upload a clear photo of your passport or government-issued ID.</p>

          <div className="space-y-6">
            <label className="block">
              <div className="relative border-2 border-dashed border-[#641AE4]/40 rounded-lg p-12 text-center cursor-pointer hover:border-[#641AE4] transition-colors">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div className="space-y-3">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-[#F0F0F0] font-medium">Click to upload or drag and drop</p>
                    <p className="text-[#B0B0B8] text-sm mt-1">PNG, JPG or PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            </label>

            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-[#2D2D3D] rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#C8F55A] text-2xl">✓</div>
                  <div>
                    <p className="text-[#F0F0F0] font-medium">{uploadedFile.name}</p>
                    <p className="text-[#B0B0B8] text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-[#B0B0B8] hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/auth/onboard/personal" className="flex-1">
                <button
                  type="button"
                  className="w-full py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:bg-[#2D2D3D] transition-all"
                >
                  Back
                </button>
              </Link>
              <button
                onClick={handleUpload}
                disabled={!uploadedFile || uploading}
                className="flex-1 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
