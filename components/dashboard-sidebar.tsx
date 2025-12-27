"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LogOut, User } from "lucide-react"

interface SidebarProps {
  role: "client" | "dealer" | "admin"
  currentPath: string
}

const roleMenus = {
  client: [
    { name: "Dashboard", href: "/client/dashboard", icon: "📊" },
    { name: "Request Quote", href: "/client/trade", icon: "💱" },
    { name: "History", href: "/client/history", icon: "📜" },
    { name: "Wallet", href: "/client/wallet", icon: "💰" },
    { name: "Settings", href: "/client/settings", icon: "⚙️" },
  ],
  dealer: [
    { name: "Dashboard", href: "/dealer/dashboard", icon: "📊" },
    { name: "Quote Queue", href: "/dealer/quotes", icon: "📋" },
    { name: "Trades", href: "/dealer/trades", icon: "💼" },
    { name: "Reports", href: "/dealer/reports", icon: "📈" },
    { name: "Settings", href: "/dealer/settings", icon: "⚙️" },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
    { name: "Audit Logs", href: "/admin/audit", icon: "📝" },
    { name: "Reports", href: "/admin/reports", icon: "📈" },
  ],
}

export function DashboardSidebar({ role, currentPath }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const menu = roleMenus[role]

  const handleLogout = () => {
    // Clear any session data
    sessionStorage.clear()
    localStorage.clear()
    // Redirect to login
    router.push("/auth/login")
  }

  return (
    <>
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <motion.aside
        initial={{ x: 0 }}
        className="hidden md:block w-64 bg-sidebar border-r border-sidebar-border h-screen"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border flex items-center justify-center">
            <div className="relative w-full h-14">
              <Image
                src="/images/mainlogo_type.svg"
                alt="GemEx"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menu.map((item) => {
              const isActive = currentPath === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative px-4 py-3 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-3 ${
                      isActive
                        ? "bg-primary/10 text-secondary border border-primary/20"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-r"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-accent rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate capitalize">{role} User</p>
                <p className="text-xs text-muted-foreground truncate">{role}@gemex.demo</p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-destructive-foreground bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-all focus:outline-none focus:ring-2 focus:ring-destructive/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>

            {/* Version */}
            <div className="text-xs text-muted-foreground text-center">
              <p>GemEx OTC v1.0.0</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
