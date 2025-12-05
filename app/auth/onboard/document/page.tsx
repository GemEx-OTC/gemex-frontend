"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { KycProgressBar } from "@/components/kyc-progress-bar"
import { Upload, FileCheck, X } from "lucide-react"

export default function DocumentUploadPage() {
  const router = useRouter()
  const [documentType, setDocumentType] = useState<"passport" | "drivers_license" | "national_id">("passport")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragActive, setDragActive] = useState<"front" | "back" | null>(null)

  const handleDrag = useCallback((e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(side)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        if (side === "front") setFrontFile(file)
        else setBackFile(file)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (side === "front") setFrontFile(file)
      else setBackFile(file)
    }
  }

  const removeFile = (side: "front" | "back") => {
    if (side === "front") setFrontFile(null)
    else setBackFile(null)
  }

  const handleSubmit = async () => {
    if (!frontFile) return

    setUploading(true)
    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      setUploadSuccess(true)
      // Flash effect then navigate
      setTimeout(() => {
        router.push("/auth/onboard/pending")
      }, 1500)
    }, 2000)
  }

  const needsBackSide = documentType !== "passport"

  return (
    <div className="min-h-screen bg-[#1E1E2B] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <KycProgressBar currentStep={2} totalSteps={3} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E2B]/80 backdrop-blur-xl border border-[#641AE4]/30 rounded-2xl p-8 mt-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-2">Upload Identity Document</h1>
            <p className="text-[#B0B0B8]">
              Please upload a clear photo of your government-issued ID. Make sure all details are visible.
            </p>
          </div>

          {/* Document Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#F0F0F0] mb-3">Select Document Type</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "passport", label: "Passport", icon: "🛂" },
                { value: "drivers_license", label: "Driver's License", icon: "🪪" },
                { value: "national_id", label: "National ID", icon: "🆔" },
              ].map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDocumentType(type.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    documentType === type.value
                      ? "border-[#C8F55A] bg-[#C8F55A]/10"
                      : "border-[#2D2D3D] bg-[#2D2D3D]/50 hover:border-[#641AE4]/40"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium text-[#F0F0F0]">{type.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Upload Areas */}
          <div className={`grid ${needsBackSide ? "md:grid-cols-2" : "grid-cols-1"} gap-6 mb-8`}>
            {/* Front Side */}
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
                {needsBackSide ? "Front Side" : "Document"} <span className="text-red-400">*</span>
              </label>
              <AnimatePresence mode="wait">
                {!frontFile ? (
                  <motion.div
                    key="dropzone-front"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragEnter={(e) => handleDrag(e, "front")}
                    onDragLeave={(e) => handleDrag(e, "front")}
                    onDragOver={(e) => handleDrag(e, "front")}
                    onDrop={(e) => handleDrop(e, "front")}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      dragActive === "front"
                        ? "border-[#C8F55A] bg-[#C8F55A]/10"
                        : "border-[#2D2D3D] hover:border-[#641AE4]/40"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "front")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-12 h-12 text-[#641AE4] mx-auto mb-4" />
                    <p className="text-[#F0F0F0] font-medium mb-2">Drop your file here or click to browse</p>
                    <p className="text-sm text-[#B0B0B8]">PNG, JPG up to 10MB</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-front"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative border-2 border-[#C8F55A] bg-[#C8F55A]/10 rounded-lg p-6"
                  >
                    <button
                      onClick={() => removeFile("front")}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                    <FileCheck className="w-12 h-12 text-[#C8F55A] mx-auto mb-3" />
                    <p className="text-[#F0F0F0] font-medium text-center truncate">{frontFile.name}</p>
                    <p className="text-sm text-[#B0B0B8] text-center mt-1">
                      {(frontFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Back Side (if needed) */}
            {needsBackSide && (
              <div>
                <label className="block text-sm font-medium text-[#F0F0F0] mb-3">
                  Back Side <span className="text-red-400">*</span>
                </label>
                <AnimatePresence mode="wait">
                  {!backFile ? (
                    <motion.div
                      key="dropzone-back"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onDragEnter={(e) => handleDrag(e, "back")}
                      onDragLeave={(e) => handleDrag(e, "back")}
                      onDragOver={(e) => handleDrag(e, "back")}
                      onDrop={(e) => handleDrop(e, "back")}
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                        dragActive === "back"
                          ? "border-[#C8F55A] bg-[#C8F55A]/10"
                          : "border-[#2D2D3D] hover:border-[#641AE4]/40"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "back")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-12 h-12 text-[#641AE4] mx-auto mb-4" />
                      <p className="text-[#F0F0F0] font-medium mb-2">Drop your file here or click to browse</p>
                      <p className="text-sm text-[#B0B0B8]">PNG, JPG up to 10MB</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview-back"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative border-2 border-[#C8F55A] bg-[#C8F55A]/10 rounded-lg p-6"
                    >
                      <button
                        onClick={() => removeFile("back")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                      <FileCheck className="w-12 h-12 text-[#C8F55A] mx-auto mb-3" />
                      <p className="text-[#F0F0F0] font-medium text-center truncate">{backFile.name}</p>
                      <p className="text-sm text-[#B0B0B8] text-center mt-1">
                        {(backFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Success Flash */}
          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-lg bg-[#C8F55A]/20 border-2 border-[#C8F55A] text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-2"
                >
                  ✓
                </motion.div>
                <p className="text-[#C8F55A] font-semibold">Documents uploaded successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Box */}
          <div className="bg-[#641AE4]/10 border border-[#641AE4]/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-[#F0F0F0]">
              <strong>Tips for best results:</strong>
            </p>
            <ul className="text-sm text-[#B0B0B8] mt-2 space-y-1 ml-4">
              <li>• Ensure all text is clearly readable</li>
              <li>• Avoid glare and shadows</li>
              <li>• Capture the entire document within the frame</li>
              <li>• Use a plain background</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!frontFile || (needsBackSide && !backFile) || uploading}
              className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:shadow-lg hover:shadow-[#C8F55A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Submit for Verification"}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              disabled={uploading}
              className="w-full px-6 py-3 rounded-lg font-semibold text-[#F0F0F0] border border-[#2D2D3D] hover:border-[#641AE4] transition-all disabled:opacity-50"
            >
              Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
