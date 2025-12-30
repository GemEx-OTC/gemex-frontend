"use client"

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import { motion } from "framer-motion"

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  error?: boolean
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  error = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Split value into array
  const valueArray = value.split("").slice(0, length)
  while (valueArray.length < length) {
    valueArray.push("")
  }

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, char: string) => {
    if (disabled) return

    // Only allow digits
    const digit = char.replace(/\D/g, "").slice(-1)
    
    const newValue = valueArray.slice()
    newValue[index] = digit
    onChange(newValue.join(""))

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === "Backspace") {
      e.preventDefault()
      const newValue = valueArray.slice()
      
      if (valueArray[index]) {
        // Clear current input
        newValue[index] = ""
        onChange(newValue.join(""))
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = ""
        onChange(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    
    if (pastedData) {
      onChange(pastedData.padEnd(length, "").slice(0, length))
      // Focus the next empty input or the last one
      const nextEmptyIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[nextEmptyIndex]?.focus()
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
    // Select the input content
    inputRefs.current[index]?.select()
  }

  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {valueArray.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <input
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            className={`
              w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl
              transition-all duration-200 outline-none
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${error
                ? "bg-red-500/10 border-2 border-red-500/50 text-red-400"
                : focusedIndex === index
                  ? "bg-primary/10 border-2 border-primary text-foreground shadow-lg shadow-primary/20"
                  : digit
                    ? "bg-card border-2 border-primary/50 text-foreground"
                    : "bg-muted border-2 border-border text-foreground hover:border-muted-foreground/50"
              }
            `}
            aria-label={`Digit ${index + 1}`}
          />
        </motion.div>
      ))}
    </div>
  )
}
