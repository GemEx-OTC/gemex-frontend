"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Wallet, LayoutDashboard, Users, Briefcase, Bell, BarChart3 } from "lucide-react"
import { useNotifications } from "@/lib/hooks/useNotifications"

interface MobileBottomNavProps {
  role: "client" | "dealer" | "admin"
}

// Core navigation items only - max 5 items for mobile bottom nav
const roleNavItems = {
  client: [
    { name: "Home", href: "/client/dashboard", icon: Home },
    { name: "Quotes", href: "/client/quotes", icon: FileText },
    { name: "History", href: "/client/history", icon: LayoutDashboard },
    { name: "Alerts", href: "/client/notifications", icon: Bell },
    { name: "Deposit", href: "/client/wallet", icon: Wallet },
  ],
  dealer: [
    { name: "Home", href: "/dealer/dashboard", icon: Home },
    { name: "Quotes", href: "/dealer/quotes", icon: FileText },
    { name: "Trades", href: "/dealer/trades", icon: Briefcase },
    { name: "Deposit", href: "/dealer/wallet", icon: Wallet },
  ],
  admin: [
    { name: "Home", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Alerts", href: "/admin/notifications", icon: Bell },
    { name: "Dealers", href: "/admin/dealers", icon: Briefcase },
  ],
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname()
  const navItems = roleNavItems[role]
  
  // Fetch notifications for clients and admins
  const shouldFetchNotifications = role === "client" || role === "admin"
  const { unreadCount } = useNotifications({
    autoFetch: shouldFetchNotifications,
    pollInterval: shouldFetchNotifications ? 30000 : 0,
    filters: { limit: 5 },
  })

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isNotifications = item.name === "Alerts"

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "text-secondary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary"
                    />
                  )}
                  {isNotifications && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
