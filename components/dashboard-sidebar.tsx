"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { GemExLogo } from "./gemex-logo"

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
  const menu = roleMenus[role]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-[#2D2D3D] text-[#F0F0F0]"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 md:hidden bg-black/50" />}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: mobileOpen ? 0 : 0 }}
        className={`fixed left-0 top-0 h-screen w-64 bg-[#1E1E2B] border-r border-[#2D2D3D] z-30 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform md:relative md:h-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#2D2D3D] flex items-center gap-3">
            <GemExLogo size={40} />
            <span className="text-lg font-bold text-[#F0F0F0]">GemEx</span>
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
                        ? "bg-[#641AE4]/20 text-[#C8F55A]"
                        : "text-[#B0B0B8] hover:text-[#F0F0F0] hover:bg-[#2D2D3D]"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8F55A] rounded-r"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#2D2D3D] space-y-2">
            <div className="text-xs text-[#B0B0B8] text-center">
              <p className="font-medium text-[#F0F0F0] mb-1">GemEx OTC Desk</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
