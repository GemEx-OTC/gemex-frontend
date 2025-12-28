"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Wallet, Settings, LayoutDashboard, Users, Bell } from "lucide-react"

interface MobileBottomNavProps {
  role: "client" | "dealer" | "admin"
}

const roleNavItems = {
  client: [
    { name: "Dashboard", href: "/client/dashboard", icon: Home },
    { name: "Trade", href: "/client/trade", icon: LayoutDashboard },
    { name: "Alerts", href: "/client/notifications", icon: Bell },
    { name: "Wallet", href: "/client/wallet", icon: Wallet },
    { name: "Settings", href: "/client/settings", icon: Settings },
  ],
  dealer: [
    { name: "Dashboard", href: "/dealer/dashboard", icon: Home },
    { name: "Quotes", href: "/dealer/quotes", icon: FileText },
    { name: "Alerts", href: "/dealer/notifications", icon: Bell },
    { name: "Trades", href: "/dealer/trades", icon: LayoutDashboard },
    { name: "Settings", href: "/dealer/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Alerts", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const pathname = usePathname()
  const navItems = roleNavItems[role]

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
