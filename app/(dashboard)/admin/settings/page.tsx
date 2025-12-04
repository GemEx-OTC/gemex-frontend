"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminSettingsPage() {
  const [exchangeRates, setExchangeRates] = useState({
    btcNgn: "43500000",
    ethNgn: "2850000",
    usdtNgn: "1565",
  })
  const [saved, setSaved] = useState(false)

  const handleSaveRates = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardHeader title="System Settings" subtitle="Configure exchange rates and platform parameters" />

      {/* Exchange Rates */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 10 }} className="max-w-2xl">
        <div className="p-8 bg-gradient-to-br from-[#641AE4]/20 to-[#9A24D2]/10 border border-[#641AE4]/40 rounded-xl mb-6">
          <h2 className="text-xl font-bold text-[#F0F0F0] mb-6">Exchange Rates</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">BTC to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.btcNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, btcNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">ETH to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.ethNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, ethNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F0F0F0] mb-2">USDT to NGN Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={exchangeRates.usdtNgn}
                  onChange={(e) => setExchangeRates({ ...exchangeRates, usdtNgn: e.target.value })}
                  className="flex-1 bg-[#2D2D3D] border-b-2 border-transparent focus:border-b-[#C8F55A] text-[#F0F0F0] px-4 py-3 rounded transition-all focus:outline-none font-mono"
                />
                <span className="text-[#B0B0B8]">NGN</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#C8F55A]/10 border border-[#C8F55A]/20 rounded-lg">
            <p className="text-[#C8F55A] text-sm font-medium">
              ⚠️ Rate changes take effect immediately and affect all new quotes
            </p>
          </div>

          <motion.button
            onClick={handleSaveRates}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-3 rounded-lg font-semibold text-[#1E1E2B] bg-[#C8F55A] hover:opacity-90 transition-all"
          >
            {saved ? "✓ Rates Updated" : "Save Exchange Rates"}
          </motion.button>
        </div>

        {/* Additional Settings */}
        <div className="p-6 bg-[#1E1E2B]/60 border border-[#2D2D3D] rounded-xl">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Platform Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#2D2D3D] rounded-lg">
              <span className="text-[#B0B0B8]">Two-Factor Authentication</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2D2D3D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#641AE4]" />
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2D2D3D] rounded-lg">
              <span className="text-[#B0B0B8]">Email Verification</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#2D2D3D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#641AE4]" />
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
