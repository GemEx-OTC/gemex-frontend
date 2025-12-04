"use client"

import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts"

interface DemoAccountsCardProps {
  onSelectAccount?: (email: string, password: string) => void
}

export function DemoAccountsCard({ onSelectAccount }: DemoAccountsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    const { copyToClipboard: copy } = await import("@/lib/clipboard")
    const success = await copy(text)
    if (success) {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const accounts = [
    {
      ...DEMO_ACCOUNTS.client,
      icon: "👤",
      color: "from-[#641AE4] to-[#9A24D2]",
      description: "Access client trading dashboard",
    },
    {
      ...DEMO_ACCOUNTS.dealer,
      icon: "💼",
      color: "from-[#9A24D2] to-[#641AE4]",
      description: "Manage quotes and process trades",
    },
    {
      ...DEMO_ACCOUNTS.admin,
      icon: "⚙️",
      color: "from-[#641AE4] to-[#C8F55A]",
      description: "Full system administration access",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2D2D3D]/30 border border-[#641AE4]/30 rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎭</span>
        <div>
          <h3 className="text-lg font-semibold text-[#F0F0F0]">Demo Accounts</h3>
          <p className="text-sm text-[#B0B0B8]">Test different user roles</p>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <motion.div
            key={account.role}
            whileHover={{ scale: 1.01 }}
            className="bg-[#1E1E2B]/50 border border-[#2D2D3D] rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center text-xl`}>
                  {account.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[#F0F0F0] capitalize">{account.role}</h4>
                  <p className="text-xs text-[#B0B0B8]">{account.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#2D2D3D] rounded px-3 py-2">
                  <p className="text-xs text-[#B0B0B8] mb-0.5">Email</p>
                  <p className="text-sm text-[#F0F0F0] font-mono">{account.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(account.email, `${account.role}-email`)}
                  className="p-2 rounded-lg bg-[#641AE4]/20 hover:bg-[#641AE4]/30 transition-colors"
                >
                  {copiedField === `${account.role}-email` ? (
                    <Check className="w-4 h-4 text-[#C8F55A]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#641AE4]" />
                  )}
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#2D2D3D] rounded px-3 py-2">
                  <p className="text-xs text-[#B0B0B8] mb-0.5">Password</p>
                  <p className="text-sm text-[#F0F0F0] font-mono">{account.password}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(account.password, `${account.role}-password`)}
                  className="p-2 rounded-lg bg-[#641AE4]/20 hover:bg-[#641AE4]/30 transition-colors"
                >
                  {copiedField === `${account.role}-password` ? (
                    <Check className="w-4 h-4 text-[#C8F55A]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#641AE4]" />
                  )}
                </motion.button>
              </div>
            </div>

            {onSelectAccount && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectAccount(account.email, account.password)}
                className="w-full py-2 rounded-lg text-sm font-medium text-[#F0F0F0] bg-[#641AE4]/20 hover:bg-[#641AE4]/30 transition-colors"
              >
                Use this account
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#2D2D3D]">
        <p className="text-xs text-[#B0B0B8] text-center">
          💡 Click "Use this account" or copy credentials to login
        </p>
      </div>
    </motion.div>
  )
}
