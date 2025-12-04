// Platform constants based on backend specification

export const CRYPTO_ASSETS = {
  USDT: { name: "Tether", symbol: "USDT", icon: "₮" },
  BTC: { name: "Bitcoin", symbol: "BTC", icon: "₿" },
  USDC: { name: "USD Coin", symbol: "USDC", icon: "$" },
} as const

export const CRYPTO_NETWORKS = {
  TRC20: { name: "Tron (TRC20)", chain: "TRON" },
  BSC: { name: "BNB Smart Chain", chain: "BSC" },
  ERC20: { name: "Ethereum (ERC20)", chain: "ETH" },
  BTC: { name: "Bitcoin Network", chain: "BTC" },
} as const

export const TRANSACTION_STATUS = {
  QuotePending: {
    label: "Quote Pending",
    color: "text-[#641AE4]",
    bg: "bg-[#641AE4]/20",
    description: "Waiting for dealer quote",
  },
  AwaitingDeposit: {
    label: "Awaiting Deposit",
    color: "text-[#9A24D2]",
    bg: "bg-[#9A24D2]/20",
    description: "Waiting for crypto deposit",
  },
  CryptoConfirmed: {
    label: "Crypto Confirmed",
    color: "text-[#C8F55A]",
    bg: "bg-[#C8F55A]/20",
    description: "Deposit confirmed on blockchain",
  },
  PayoutPending: {
    label: "Payout Pending",
    color: "text-[#641AE4]",
    bg: "bg-[#641AE4]/20",
    description: "Processing Naira payout",
  },
  Settled: {
    label: "Settled",
    color: "text-[#C8F55A]",
    bg: "bg-[#C8F55A]/20",
    description: "Transaction completed",
  },
  Failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/20",
    description: "Transaction failed",
  },
} as const

export const QUOTE_STATUS = {
  Active: {
    label: "Active",
    color: "text-[#C8F55A]",
    bg: "bg-[#C8F55A]/20",
  },
  Used: {
    label: "Used",
    color: "text-[#B0B0B8]",
    bg: "bg-[#2D2D3D]",
  },
  Expired: {
    label: "Expired",
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  Canceled: {
    label: "Canceled",
    color: "text-[#B0B0B8]",
    bg: "bg-[#2D2D3D]",
  },
} as const

export const USER_ROLES = {
  client: {
    label: "Client",
    description: "Verified users who initiate trades",
    color: "from-[#641AE4] to-[#9A24D2]",
  },
  dealer: {
    label: "Dealer",
    description: "Staff who set firm rates and manage quotes",
    color: "from-[#9A24D2] to-[#641AE4]",
  },
  admin: {
    label: "Admin",
    description: "Superuser with full system control",
    color: "from-[#641AE4] to-[#C8F55A]",
  },
} as const

export const NOTIFICATION_TYPES = {
  QuoteGenerated: "New Quote Generated",
  QuoteAccepted: "Quote Accepted",
  DepositConfirmed: "Crypto Deposit Confirmed",
  PayoutSuccess: "Naira Payout Success",
  AccountStatusChange: "Account Status Changed",
  AdminAction: "Admin Action Taken",
} as const

export const KYC_STATUS = {
  Pending: {
    label: "Pending Verification",
    color: "text-[#641AE4]",
    bg: "bg-[#641AE4]/20",
  },
  Verified: {
    label: "Verified",
    color: "text-[#C8F55A]",
    bg: "bg-[#C8F55A]/20",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  Suspended: {
    label: "Suspended",
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
} as const

// Nigerian Banks (sample - add more as needed)
export const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
] as const
