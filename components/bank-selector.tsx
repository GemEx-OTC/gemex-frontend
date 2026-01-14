"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Building2, Check, X } from "lucide-react"
import banksData from "@/lib/data/banks.json"

interface Bank {
  name: string
  code: string
  nipBankCode: string | null
}

interface BankSelectorProps {
  value: string
  onChange: (bankCode: string, bankName: string) => void
  placeholder?: string
  disabled?: boolean
}

export function BankSelector({ value, onChange, placeholder = "Search for your bank...", disabled = false }: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Get unique banks sorted alphabetically
  const banks = useMemo(() => {
    const uniqueBanks = new Map<string, Bank>()
    banksData.forEach((bank: Bank) => {
      if (!uniqueBanks.has(bank.code)) {
        uniqueBanks.set(bank.code, bank)
      }
    })
    return Array.from(uniqueBanks.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Filter banks based on search
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks
    const query = searchQuery.toLowerCase()
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.code.includes(query)
    )
  }, [banks, searchQuery])

  // Get selected bank
  const selectedBank = useMemo(() => {
    return banks.find((b) => b.code === value)
  }, [banks, value])


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (bank: Bank) => {
    onChange(bank.code, bank.name)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
    setSearchQuery("")
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all
          ${disabled ? "bg-[#2D2D3D]/50 cursor-not-allowed" : "bg-[#2D2D3D] hover:bg-[#3D3D4D] cursor-pointer"}
          ${isOpen ? "ring-2 ring-[#C8F55A] border-transparent" : "border-b-2 border-transparent"}
          text-left`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Building2 className={`w-5 h-5 flex-shrink-0 ${selectedBank ? "text-[#C8F55A]" : "text-[#B0B0B8]"}`} />
          <span className={`truncate ${selectedBank ? "text-[#F0F0F0]" : "text-[#B0B0B8]"}`}>
            {selectedBank ? selectedBank.name : "Choose your bank"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedBank && !disabled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleClear}
              className="p-1 hover:bg-[#4D4D5D] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-[#B0B0B8]" />
            </motion.div>
          )}
          <ChevronDown className={`w-5 h-5 text-[#B0B0B8] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </motion.button>


      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#1E1E2B] border border-[#2D2D3D] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#2D2D3D]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0B8]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#2D2D3D] border border-transparent focus:border-[#641AE4] rounded-lg text-[#F0F0F0] placeholder-[#B0B0B8] text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bank List */}
            <div ref={listRef} className="max-h-64 overflow-y-auto overscroll-contain">
              {filteredBanks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Building2 className="w-10 h-10 text-[#B0B0B8]/50 mx-auto mb-2" />
                  <p className="text-sm text-[#B0B0B8]">No banks found</p>
                  <p className="text-xs text-[#B0B0B8]/70 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredBanks.map((bank) => {
                    const isSelected = bank.code === value
                    return (
                      <motion.button
                        key={bank.code}
                        type="button"
                        onClick={() => handleSelect(bank)}
                        whileHover={{ backgroundColor: "rgba(100, 26, 228, 0.1)" }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors
                          ${isSelected ? "bg-[#641AE4]/20" : "hover:bg-[#2D2D3D]"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                            ${isSelected ? "bg-[#C8F55A]/20" : "bg-[#2D2D3D]"}`}>
                            <Building2 className={`w-4 h-4 ${isSelected ? "text-[#C8F55A]" : "text-[#B0B0B8]"}`} />
                          </div>
                          <p className={`text-sm font-medium truncate ${isSelected ? "text-[#C8F55A]" : "text-[#F0F0F0]"}`}>
                            {bank.name}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-[#C8F55A] flex items-center justify-center flex-shrink-0"
                          >
                            <Check className="w-3 h-3 text-[#1E1E2B]" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[#2D2D3D] bg-[#1E1E2B]/80">
              <p className="text-xs text-[#B0B0B8]">
                {filteredBanks.length} of {banks.length} banks
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
