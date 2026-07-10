"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  FileText, 
  History, 
  Wallet, 
  Bell, 
  Settings, 
  ClipboardList,
  Briefcase,
  BarChart3,
  Users,
  Handshake,
  ScrollText,
  ChevronDown,
  TrendingUp,
  Shield,
  Activity,
  Droplets
} from "lucide-react"
import { useLogout } from "@/lib/hooks/use-auth"
import { useAuth } from "@/lib/providers/auth-provider"

interface SidebarProps {
  role: "client" | "dealer" | "admin"
  currentPath: string
}

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

interface MenuGroup {
  label: string
  icon: React.ElementType
  items: MenuItem[]
}

const roleMenus: Record<string, MenuItem[]> = {
  client: [
    { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { name: "My Quotes", href: "/client/quotes", icon: ClipboardList },
    { name: "History", href: "/client/history", icon: History },
    { name: "Deposit", href: "/client/wallet", icon: Wallet },
    { name: "Notifications", href: "/client/notifications", icon: Bell },
    { name: "Settings", href: "/client/settings", icon: Settings },
  ],
  dealer: [
    { name: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { name: "Quote Queue", href: "/dealer/quotes", icon: ClipboardList },
    { name: "Trades", href: "/dealer/trades", icon: Briefcase },
    { name: "Deposit", href: "/dealer/wallet", icon: Wallet },
    { name: "Reports", href: "/dealer/reports", icon: BarChart3 },
    { name: "Notifications", href: "/dealer/notifications", icon: Bell },
    { name: "Settings", href: "/dealer/settings", icon: Settings },
  ],
}

// Admin menu is grouped for better organization
const adminMenuGroups: MenuGroup[] = [
  {
    label: "Overview",
    icon: Activity,
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Liquidity", href: "/admin/liquidity", icon: Droplets },
      { name: "Crypto Sweep", href: "/admin/sweep", icon: TrendingUp },
      { name: "Trades", href: "/admin/trades", icon: TrendingUp },
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    ]
  },
  {
    label: "User Management",
    icon: Users,
    items: [
      { name: "Clients", href: "/admin/users", icon: Users },
      { name: "Dealers", href: "/admin/dealers", icon: Handshake },
    ]
  },
  {
    label: "Compliance",
    icon: Shield,
    items: [
      { name: "Audit Logs", href: "/admin/audit", icon: ScrollText },
    ]
  },
]

const adminGeneralItems: MenuItem[] = [
  { name: "Deposit", href: "/admin/wallet", icon: Wallet },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function SidebarItem({ item, isActive }: { item: MenuItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative px-4 py-3 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-3 ${
          isActive
            ? "bg-primary/10 text-secondary border border-primary/20"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        }`}
      >
        <Icon className="w-5 h-5" />
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
}

function CollapsibleGroup({ 
  group, 
  currentPath, 
  defaultOpen = false 
}: { 
  group: MenuGroup
  currentPath: string
  defaultOpen?: boolean 
}) {
  const hasActiveItem = group.items.some(item => currentPath === item.href)
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveItem)
  const GroupIcon = group.icon

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <GroupIcon className="w-4 h-4" />
          <span>{group.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-2">
              {group.items.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  item={item} 
                  isActive={currentPath === item.href} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DashboardSidebar({ role, currentPath }: SidebarProps) {
  const { user } = useAuth()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const renderNavigation = () => {
    if (role === "admin") {
      return (
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {adminMenuGroups.map((group) => (
            <CollapsibleGroup 
              key={group.label} 
              group={group} 
              currentPath={currentPath}
              defaultOpen={true}
            />
          ))}
          
          {/* Separator */}
          <div className="border-t border-sidebar-border my-4" />
          
          {/* General items without grouping */}
          <div className="space-y-1">
            {adminGeneralItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                item={item} 
                isActive={currentPath === item.href} 
              />
            ))}
          </div>
        </nav>
      )
    }

    // Client and Dealer menus (flat structure)
    const menu = roleMenus[role]
    return (
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            isActive={currentPath === item.href} 
          />
        ))}
      </nav>
    )
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
                alt="GemOTC"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation */}
          {renderNavigation()}

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-accent rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.fullName || `${role} User`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || `${role}@gemotc.demo`}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-destructive-foreground bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-all focus:outline-none focus:ring-2 focus:ring-destructive/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </motion.button>

            {/* Version */}
            <div className="text-xs text-muted-foreground text-center">
              <p>GemOTC v1.0.0</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
