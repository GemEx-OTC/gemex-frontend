"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileTopNav } from "@/components/mobile-top-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useNotifications } from "@/lib/hooks/useNotifications"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Fetch unread count for the notification bell
  const { unreadCount } = useNotifications({
    autoFetch: true,
    pollInterval: 30000, // Poll every 30 seconds
    filters: { limit: 1 }, // We only need the count
  })

  // Determine user role from path
  const getRole = () => {
    if (pathname.startsWith("/client")) return "client"
    if (pathname.startsWith("/dealer")) return "dealer"
    if (pathname.startsWith("/admin")) return "admin"
    return "client"
  }

  const role = getRole() as "client" | "dealer" | "admin"

  // Determine allowed roles based on the current path
  const getAllowedRoles = (): ('client' | 'admin' | 'dealer')[] => {
    if (pathname.startsWith("/admin")) return ["admin"]
    if (pathname.startsWith("/dealer")) return ["dealer", "admin"]
    if (pathname.startsWith("/client")) return ["client", "admin"]
    return ["client", "dealer", "admin"]
  }

  return (
    <ProtectedRoute allowedRoles={getAllowedRoles()}>
      <div className="flex h-screen bg-background text-foreground">
        <DashboardSidebar role={role} currentPath={pathname} />
        
        {/* Mobile Top Navigation */}
        <MobileTopNav role={role} unreadCount={unreadCount} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content area - add top padding for mobile header */}
          <main className="flex-1 overflow-y-auto pt-[60px] md:pt-0 pb-20 md:pb-0">
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav role={role} />
      </div>
    </ProtectedRoute>
  )
}
