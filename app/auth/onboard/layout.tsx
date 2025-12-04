"use client"

import type React from "react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-[#1E1E2B]">{children}</div>
}
