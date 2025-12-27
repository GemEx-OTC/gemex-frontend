"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileTopNav } from "@/components/mobile-top-nav"

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
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar role={role} currentPath={pathname} />
      
      {/* Mobile Top Navigation */}
      <MobileTopNav role={role} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area - add top padding for mobile header */}
        <main className="flex-1 overflow-y-auto pt-[60px] md:pt-0 pb-20 md:pb-0">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  )
}
