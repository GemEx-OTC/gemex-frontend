"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Determine user role from path
  const getRole = () => {
    if (pathname.startsWith("/client")) return "client"
    if (pathname.startsWith("/dealer")) return "dealer"
    if (pathname.startsWith("/admin")) return "admin"
    return "client"
  }

  const role = getRole() as "client" | "dealer" | "admin"

  return (
    <div className="flex h-screen bg-[#1E1E2B] text-[#F0F0F0]">
      <DashboardSidebar role={role} currentPath={pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
