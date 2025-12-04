"use client"

import { motion } from "framer-motion"

interface KycProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function KycProgressBar({ currentStep, totalSteps }: KycProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-medium text-[#B0B0B8]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-[#C8F55A]">{Math.round(progress)}% Complete</span>
      </div>
      <div className="h-2 bg-[#2D2D3D] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#641AE4] to-[#C8F55A]"
        />
      </div>
    </div>
  )
}
