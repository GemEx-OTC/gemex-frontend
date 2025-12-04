"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogOut } from "lucide-react"

export default function DealerSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    quoteAlerts: true,
    tradeAlerts: true,
  })

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()
    router.push("/auth/login")
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="Dealer Settings" subtitle="Manage your preferences and notifications" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg">
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Name</label>
              <input
                type="text"
                defaultValue="Dealer User"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-2 rounded transition-all focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Email</label>
              <input
                type="email"
                defaultValue="dealer@gemex.demo"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-2 rounded transition-all focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg">
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "smsNotifications", label: "SMS Notifications", desc: "Receive alerts via SMS" },
              { key: "quoteAlerts", label: "Quote Request Alerts", desc: "Get notified of new quote requests" },
              { key: "tradeAlerts", label: "Trade Status Alerts", desc: "Get notified of trade status changes" },
            ].map((item) => (
              <motion.div key={item.key} className="flex items-center justify-between p-4 bg-[#2D2D3D] rounded-lg">
                <div>
                  <p className="font-medium text-[#F0F0F0]">{item.label}</p>
                  <p className="text-sm text-[#B0B0B8]">{item.desc}</p>
                </div>
                <motion.button
                  onClick={() => handleToggle(item.key)}
                  className={`w-12 h-7 rounded-full transition-all ${
                    settings[item.key as keyof typeof settings] ? "bg-[#C8F55A]" : "bg-[#2D2D3D]"
                  }`}
                >
                  <motion.div
                    animate={{
                      x: settings[item.key as keyof typeof settings] ? 20 : 2,
                    }}
                    className="w-6 h-6 rounded-full bg-[#1E1E2B] ml-0.5"
                  />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-lg">
          <h2 className="text-lg font-semibold text-[#F0F0F0] mb-4">Working Hours</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#B0B0B8] mb-2">Start Time</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-2 rounded transition-all focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B0B0B8] mb-2">End Time</label>
              <input
                type="time"
                defaultValue="17:00"
                className="w-full bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-2 rounded transition-all focus:outline-none"
              />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
        >
          Save Changes
        </motion.button>

        {/* Logout Button - Visible on Mobile */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-[#F0F0F0] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
