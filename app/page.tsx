"use client"

import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import {
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Building2,
  Smartphone,
  ChevronDown,
  Sparkles,
  Rocket,
  Star,
  Users,
  Clock,
  Banknote,
  ArrowUp,
  Plus,
  Minus,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Send,
  Menu,
  X,
  User,
  Lock,
  RefreshCw,
  DollarSign,
  Layers,
  Globe,
  Headphones,
  CreditCard,
  ArrowRightLeft,
  Activity,
  Sliders,
  Check,
} from "lucide-react"

// Floating Particle Component
const FloatingParticle = ({ delay, duration, size, left, top }: { delay: number; duration: number; size: number; left: string; top: string }) => (
  <motion.div
    className="absolute rounded-full bg-purple-500/20 blur-sm pointer-events-none"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [0, -35, 0],
      x: [0, 20, 0],
      opacity: [0.2, 0.5, 0.2],
      scale: [1, 1.25, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
)

// Glowing Orb Component
const GlowingOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute rounded-full bg-gradient-to-br from-purple-600/30 via-violet-500/20 to-lime-400/20 blur-3xl pointer-events-none ${className}`}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.35, 0.6, 0.35],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
)

// Animated Counter Component
const AnimatedCounter = ({ end, suffix = "", prefix = "", duration = 2 }: { end: number; suffix?: string; prefix?: string; duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isVisible, end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// 3D Tilt Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]))
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]))

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <motion.div
    className="border border-[#2d2d42] rounded-xl overflow-hidden bg-[#1f1f30]/60 backdrop-blur-md"
    initial={false}
    animate={{ backgroundColor: isOpen ? "rgba(168, 85, 247, 0.08)" : "rgba(31, 31, 48, 0.6)" }}
  >
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#2d2d42]/40 transition-colors"
    >
      <span className="text-[#f8f9fa] font-medium pr-4 text-base sm:text-lg">{question}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-[#a855f7] flex-shrink-0" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-6 pb-5 text-gray-400 text-sm sm:text-base leading-relaxed border-t border-[#2d2d42]/50 pt-3">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [tradeVolume, setTradeVolume] = useState<number>(50000)
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [calcSide, setCalcSide] = useState<"buy" | "sell">("sell")
  const [calcAsset, setCalcAsset] = useState<"USDT" | "USDC" | "BTC" | "ETH">("USDT")
  
  const heroRef = useRef<HTMLElement>(null)

  // Track mouse for cursor gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Show floating CTA after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetHeight
        const scrollPosition = window.scrollY + window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        
        const shouldShow = window.scrollY > heroBottom * 0.8
        const isNearBottom = scrollPosition >= documentHeight - 200
        
        setShowFloatingCTA(shouldShow && !isNearBottom)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const faqData = [
    {
      question: "What is GemOTC and how does it differ from standard exchanges?",
      answer: "GemOTC is an institutional-grade Over-The-Counter (OTC) liquidity desk. Unlike order-book retail exchanges where large trades experience heavy slippage and price impact, GemOTC guarantees direct custom rate execution, deep liquidity, zero slippage, and instant bank or multi-chain settlement."
    },
    {
      question: "Which cryptocurrencies and fiat currencies are supported?",
      answer: "We support major crypto assets including USDT, USDC, BTC, and ETH across Ethereum, BNB Chain, Polygon, Arbitrum, and Tron. For fiat settlement, we specialize in high-speed Nigerian Naira (NGN) bank transfers as well as USD wire settlements."
    },
    {
      question: "How fast is trade settlement?",
      answer: "Most OTC trades settle in under 3 minutes upon blockchain deposit confirmation. NGN bank transfers are processed automatically via automated banking rails."
    },
    {
      question: "What are the trade limits on GemOTC?",
      answer: "GemOTC caters to high-volume individual traders, crypto merchants, and institutional funds. Our minimum OTC trade size starts at $1,000 equivalent, with no maximum cap for fully verified institutional accounts."
    },
    {
      question: "How is security handled for deposits and Sweepers?",
      answer: "GemOTC utilizes non-custodial smart contract sweeper vaults and bank-grade HSM security. Funds are routed directly into audited multisig liquidity pools with automated AML/KYC verification."
    },
  ]

  // Estimated zero-slippage savings based on volume
  const estimatedSavings = Math.round(tradeVolume * 0.018)
  const estimatedSettleTime = tradeVolume > 100000 ? "< 3 mins" : "< 90 secs"

  return (
    <div className="min-h-screen bg-[#1a1a24] text-[#f8f9fa] overflow-x-hidden selection:bg-[#a855f7]/30 selection:text-white">
      {/* Animated Interactive Cursor Glow */}
      <motion.div
        className="fixed w-96 h-96 rounded-full bg-[#a855f7]/15 blur-3xl pointer-events-none z-0"
        animate={{ x: mousePosition.x - 192, y: mousePosition.y - 192 }}
        transition={{ type: "spring", damping: 30, stiffness: 180 }}
      />

      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a24]/85 backdrop-blur-xl border-b border-[#2d2d42]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 relative flex items-center justify-center bg-[#242438] rounded-xl border border-[#a855f7]/30 shadow-lg shadow-[#a855f7]/10"
              >
                <Image src="/images/gemex-20logo.png" alt="GemOTC Logo" width={28} height={28} className="object-contain" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  GemOTC <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">Desk</span>
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors relative group py-1">
                Features
                <motion.span className="absolute bottom-0 left-0 h-0.5 bg-[#a855f7]" initial={{ width: 0 }} whileHover={{ width: "100%" }} transition={{ duration: 0.2 }} />
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors relative group py-1">
                How It Works
                <motion.span className="absolute bottom-0 left-0 h-0.5 bg-[#a855f7]" initial={{ width: 0 }} whileHover={{ width: "100%" }} transition={{ duration: 0.2 }} />
              </Link>
              <Link href="#calculator" className="text-gray-300 hover:text-white transition-colors relative group py-1">
                Calculator
                <motion.span className="absolute bottom-0 left-0 h-0.5 bg-[#a855f7]" initial={{ width: 0 }} whileHover={{ width: "100%" }} transition={{ duration: 0.2 }} />
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-white transition-colors relative group py-1">
                FAQ
                <motion.span className="absolute bottom-0 left-0 h-0.5 bg-[#a855f7]" initial={{ width: 0 }} whileHover={{ width: "100%" }} transition={{ duration: 0.2 }} />
              </Link>
            </nav>

            {/* Desktop Auth CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#7e22ce] shadow-lg shadow-[#a855f7]/25 hover:shadow-[#a855f7]/40 transition-all flex items-center gap-2 border border-purple-400/20"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  Get Started
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#242438] border border-[#2d2d42] text-gray-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-[#2d2d42] bg-[#1a1a24]/95 backdrop-blur-2xl"
            >
              <div className="px-6 py-6 space-y-4">
                <Link href="#features" className="block text-gray-300 hover:text-white text-base py-2" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#how-it-works" className="block text-gray-300 hover:text-white text-base py-2" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </Link>
                <Link href="#calculator" className="block text-gray-300 hover:text-white text-base py-2" onClick={() => setMobileMenuOpen(false)}>
                  Calculator
                </Link>
                <Link href="#faq" className="block text-gray-300 hover:text-white text-base py-2" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </Link>
                <div className="pt-4 border-t border-[#2d2d42] space-y-3">
                  <Link
                    href="/auth/login"
                    className="block text-center py-2.5 text-gray-300 hover:text-white font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block text-center px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#a855f7] to-[#7e22ce] shadow-lg shadow-[#a855f7]/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
        {/* Ambient Glows & Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GlowingOrb className="w-[650px] h-[650px] -top-44 -left-44" />
          <GlowingOrb className="w-[550px] h-[550px] top-1/2 -right-36" />
          
          {[...Array(16)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.4}
              duration={3.5 + ((i * 7 + 2) % 8) / 3}
              size={4 + ((i * 11 + 3) % 8) * 0.9}
              left={`${((i * 19 + 7) % 100)}%`}
              top={`${((i * 29 + 13) % 100)}%`}
            />
          ))}
          
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-lg shadow-[#a855f7]/5"
                animate={{ boxShadow: ["0 0 0px rgba(168,85,247,0)", "0 0 25px rgba(168,85,247,0.35)", "0 0 0px rgba(168,85,247,0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4 text-[#84cc16]" />
                </motion.div>
                Institutional OTC Desk & Instant Liquidity
              </motion.span>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Professional OTC Trading,{" "}
                <motion.span 
                  className="relative inline-block bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#84cc16] bg-clip-text text-transparent bg-[length:200%_auto]"
                  animate={{ backgroundPosition: ["0% center", "200% center"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  Reimagined
                  <motion.span
                    className="absolute -inset-1 bg-gradient-to-r from-[#a855f7]/20 to-[#84cc16]/20 blur-xl -z-10"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </motion.span>
              </h1>

              <motion.p 
                className="text-lg sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-normal leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Trade high-volume crypto and fiat with{" "}
                <span className="text-[#a855f7] font-semibold">zero market slippage</span>, institutional liquidity pools, and{" "}
                <span className="text-[#84cc16] font-semibold">instant bank settlement</span>.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(168,85,247,0.4)" }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative group w-full sm:w-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#a855f7] to-[#84cc16] rounded-2xl blur opacity-40 group-hover:opacity-80 transition-opacity" />
                  <Link
                    href="/auth/signup"
                    className="relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#7e22ce] flex items-center justify-center gap-3 shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 text-purple-200" />
                    Create OTC Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-white bg-[#242438] border border-[#374151] hover:border-[#a855f7] hover:bg-[#2d2d42] transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Lock className="w-4 h-4 text-[#a855f7]" />
                    Sign In to Portal
                  </Link>
                </motion.div>
              </motion.div>

              {/* Floating Metrics Bar */}
              <motion.div 
                className="mt-16 flex flex-wrap justify-center gap-6 sm:gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: DollarSign, value: 500, prefix: "$", suffix: "M+", label: "Volume Processed" },
                  { icon: Clock, value: 3, suffix: " min", label: "Avg. Settlement" },
                  { icon: Shield, value: 99, suffix: ".99%", label: "Uptime & Reliability" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#242438]/80 border border-[#374151]/60 backdrop-blur-md shadow-xl"
                    whileHover={{ scale: 1.05, borderColor: "rgba(168,85,247,0.5)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-[#a855f7]" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-extrabold text-lg sm:text-xl">
                        <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      </div>
                      <div className="text-gray-400 text-xs font-medium">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown className="w-7 h-7 text-[#a855f7]/60" />
        </motion.div>
      </section>

      {/* ========== LIVE STATS TICKER MARQUEE ========== */}
      <section className="py-5 border-y border-[#2d2d42] bg-[#242438]/40 overflow-hidden backdrop-blur-sm">
        <motion.div 
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex gap-16 items-center">
              {[
                { label: "24/7 OTC Concierge", value: "Active", icon: Headphones },
                { label: "Execution Slippage", value: "0.00%", icon: TrendingUp },
                { label: "AML & KYC Compliance", value: "Verified", icon: Shield },
                { label: "Multi-Chain Sweepers", value: "Automated", icon: Zap },
                { label: "Fiat Settlement Rails", value: "Instant NGN/USD", icon: Banknote },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                  <stat.icon className="w-4 h-4 text-[#84cc16]" />
                  <span className="text-gray-400">{stat.label}:</span>
                  <span className="text-[#a855f7] font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ========== HOW OTC WORKS (3D TILT CARDS) ========== */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs font-semibold uppercase tracking-wider mb-4">
              <Rocket className="w-3.5 h-3.5 text-[#84cc16]" /> Streamlined Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              How OTC Liquidity Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
              Execute high-volume crypto and fiat exchanges in four seamless steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Horizontal Line Connector */}
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent -translate-y-1/2 z-0" />

            {[
              { step: 1, icon: Building2, title: "1. Register & Verify", desc: "Fast-track corporate or individual KYC verification for immediate OTC access.", color: "from-[#a855f7] to-[#7e22ce]" },
              { step: 2, icon: RefreshCw, title: "2. Request OTC Quote", desc: "Lock in live guaranteed exchange rates with zero market slippage.", color: "from-[#7e22ce] to-[#3b82f6]" },
              { step: 3, icon: ArrowRightLeft, title: "3. Secure Deposit", desc: "Transfer crypto or fiat to designated segregated sweeper addresses.", color: "from-[#3b82f6] to-[#06b6d4]" },
              { step: 4, icon: CheckCircle, title: "4. Instant Payout", desc: "Receive automated payouts directly to your corporate bank account or wallet.", color: "from-[#06b6d4] to-[#84cc16]" },
            ].map((item, idx) => (
              <TiltCard key={item.step} className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className="relative group h-full"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a855f7]/40 to-[#84cc16]/40 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-[#242438] border border-[#374151] rounded-3xl p-7 text-center h-full flex flex-col items-center justify-between group-hover:border-[#a855f7]/60 transition-colors shadow-xl">
                    <div>
                      <motion.div 
                        className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="w-full h-full rounded-[14px] bg-[#1a1a24] flex items-center justify-center">
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <div className="text-[#84cc16] font-bold text-xs uppercase tracking-widest mb-2">STEP {item.step}</div>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INTERACTIVE TRADE MOCKUP SECTION ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#242438]/50 to-transparent relative overflow-hidden">
        <GlowingOrb className="w-[500px] h-[500px] top-1/2 left-1/3 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Trade Preview Box */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative mx-auto lg:mx-0 w-full max-w-md"
            >
              <div className="relative bg-[#242438] rounded-3xl border border-[#374151] p-6 sm:p-8 shadow-2xl shadow-[#a855f7]/10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#374151] pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white font-bold text-base">Live OTC Desk Rate</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#a855f7]/20 text-[#a855f7] font-semibold border border-[#a855f7]/30">
                    Guaranteed Rate
                  </span>
                </div>

                {/* Trade Card Details */}
                <div className="space-y-5">
                  <div className="bg-[#1a1a24] p-4 rounded-2xl border border-[#2d2d42]">
                    <div className="text-xs text-gray-400 mb-1 font-medium">You Deposit</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">50,000.00</span>
                      <span className="px-3 py-1 bg-[#242438] rounded-xl text-sm font-semibold text-purple-300 border border-[#374151]">USDT</span>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2">
                    <div className="w-10 h-10 rounded-full bg-[#a855f7] text-white flex items-center justify-center shadow-lg">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-[#1a1a24] p-4 rounded-2xl border border-[#2d2d42]">
                    <div className="text-xs text-gray-400 mb-1 font-medium">You Receive (Naira)</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#84cc16]">₦82,500,000.00</span>
                      <span className="px-3 py-1 bg-[#242438] rounded-xl text-sm font-semibold text-lime-400 border border-[#374151]">NGN</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="bg-[#a855f7]/10 p-4 rounded-2xl border border-[#a855f7]/30 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#84cc16] flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      <span className="font-semibold text-white">Zero Slippage Locked:</span> Trade will execute precisely at ₦1,650/USDT without market impact.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Explanatory Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs font-semibold uppercase tracking-wider mb-4">
                <Shield className="w-4 h-4 text-[#84cc16]" /> Zero Slippage Engine
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                Institutional Rates with Guaranteed Execution
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                When trading large volumes on order books, order slippage can burn up to 3-5% of your total funds. GemOTC locks your custom quote upfront, ensuring 100% full value delivery.
              </p>
              
              <div className="space-y-4">
                {[
                  "Lock in fixed rates before sending any funds",
                  "Non-custodial smart contract sweeper verification",
                  "Direct bank settlement in minutes with full reference tracking",
                  "Dedicated 24/7 OTC account representative for high volume traders",
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3.5"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#84cc16]" />
                    </div>
                    <span className="text-gray-200 text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== INSTITUTIONAL FEATURES GRID ========== */}
      <section id="features" className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs font-semibold uppercase tracking-wider mb-4">
              <Star className="w-4 h-4 text-[#84cc16]" /> Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Built for Professional Traders & Funds
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
              Everything required to execute large-scale digital asset transactions seamlessly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Deep Liquidity Pools",
                desc: "Direct access to tier-1 liquidity providers ensuring zero price slippage regardless of order size.",
                tag: "Zero Slippage"
              },
              {
                icon: RefreshCw,
                title: "Real-Time Rate Engine",
                desc: "Live stream of competitive institutional rates updated every second across crypto and fiat pairs.",
                tag: "Sub-Second Updates"
              },
              {
                icon: Globe,
                title: "Multi-Asset Coverage",
                desc: "Trade USDT, USDC, BTC, and ETH with direct settlement into NGN bank accounts or USD wires.",
                tag: "Multi-Chain"
              },
              {
                icon: Lock,
                title: "Sweeper Contract Security",
                desc: "Audited smart contract sweepers automatically move and verify deposits with bank-grade safety.",
                tag: "Smart Sweepers"
              },
              {
                icon: Sliders,
                title: "API & Webhook Integrations",
                desc: "Automate your OTC operations with full REST API and real-time webhook transaction notifications.",
                tag: "Developer Ready"
              },
              {
                icon: Headphones,
                title: "24/7 VIP Concierge",
                desc: "Personal desk manager assigned to assist with custom quotes, large block trades, and verification.",
                tag: "Dedicated Support"
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-[#242438] border border-[#374151] rounded-3xl p-8 hover:border-[#a855f7]/60 transition-all shadow-xl relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
                      <card.icon className="w-7 h-7 text-[#a855f7]" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1a1a24] text-gray-300 border border-[#374151]">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{card.desc}</p>
                </div>
                <div className="pt-4 border-t border-[#374151]/50 flex items-center text-xs font-semibold text-[#a855f7] group-hover:text-purple-300 transition-colors">
                  Learn more <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INTERACTIVE CALCULATOR SECTION ========== */}
      <section id="calculator" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#242438]/30 border-y border-[#2d2d42] relative">
        <div className="max-w-5xl mx-auto bg-[#242438] border border-[#374151] rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sliders className="w-4 h-4" /> Settlement Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Estimate Your OTC Execution
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2">
              See how much you save with zero slippage execution on GemOTC.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Trade Volume (USD): <span className="text-white font-bold">${tradeVolume.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={tradeVolume}
                  onChange={(e) => setTradeVolume(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#1a1a24] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                  <span>$5,000</span>
                  <span>$250,000</span>
                  <span>$500,000+</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Select Asset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["USDT", "USDC", "BTC", "ETH"] as const).map((asset) => (
                    <button
                      key={asset}
                      onClick={() => setCalcAsset(asset)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        calcAsset === asset
                          ? "bg-[#a855f7] text-white border-[#a855f7] shadow-md shadow-[#a855f7]/20"
                          : "bg-[#1a1a24] text-gray-400 border-[#374151] hover:text-white"
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-[#1a1a24] rounded-2xl p-6 border border-[#374151] space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-[#2d2d42]">
                <span className="text-sm text-gray-400">Guaranteed Slippage</span>
                <span className="text-base font-bold text-[#84cc16]">0.00%</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#2d2d42]">
                <span className="text-sm text-gray-400">Estimated Slippage Savings</span>
                <span className="text-base font-bold text-purple-300">${estimatedSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Est. Settlement Time</span>
                <span className="text-base font-bold text-white">{estimatedSettleTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs font-semibold uppercase tracking-wider mb-4">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Everything you need to know about trading on GemOTC.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === idx}
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FLOATING CTA BAR ========== */}
      <AnimatePresence>
        {showFloatingCTA && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-[#242438]/90 backdrop-blur-2xl border border-[#a855f7]/50 rounded-2xl p-4 shadow-2xl shadow-[#a855f7]/30 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Ready to Trade OTC?</div>
                <div className="text-gray-400 text-xs">Zero slippage & instant bank payout</div>
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:shadow-lg hover:shadow-[#a855f7]/30 transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-[#2d2d42] bg-[#14141d] pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 relative flex items-center justify-center bg-[#242438] rounded-xl border border-[#a855f7]/30">
                <Image src="/images/gemex-20logo.png" alt="GemOTC Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-white">GemOTC Desk</span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed">
              Institutional crypto & fiat OTC liquidity desk providing zero slippage execution, instant settlement, and bank-grade security.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#calculator" className="hover:text-white transition-colors">Rate Calculator</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Client Portal</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Legal & Compliance</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">AML & KYC Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Risk Disclosure</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">System Status</h4>
            <div className="bg-[#1a1a24] p-4 rounded-2xl border border-[#2d2d42] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
              <div className="text-[11px] text-gray-400">
                OTC Engine: <span className="text-white font-medium">Online</span>
              </div>
              <div className="text-[11px] text-gray-400">
                Settlement Rails: <span className="text-white font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#2d2d42]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>© {new Date().getFullYear()} GemOTC Desk. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
