"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, X, User, LogOut, Bell } from "lucide-react"
import { useLogout } from "@/lib/hooks/use-auth"
import { useAuth } from "@/lib/providers/auth-provider"

interface MobileTopNavProps {
  role: "client" | "dealer" | "admin"
  unreadCount?: number
}

export function MobileTopNav({ role, unreadCount = 3 }: MobileTopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const handleNotificationsClick = () => {
    router.push(`/${role}/notifications`)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border safe-area-inset-top"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href={`/${role}/dashboard`} className="flex items-center">
            <div className="relative w-24 h-8">
              <Image
                src="/images/mainlogo_type.svg"
                alt="GemEx"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleNotificationsClick}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-secondary rounded-full px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>

            {/* Menu toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed top-[60px] left-4 right-4 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-border bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{user?.fullName || `${role} User`}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || `${role}@gemex.demo`}</p>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="p-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
