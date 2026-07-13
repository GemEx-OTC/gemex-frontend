// Platform constants based on backend specification

export const CRYPTO_ASSETS = {
  USDT: { name: "Tether", symbol: "USDT", icon: "₮" },
  BTC: { name: "Bitcoin", symbol: "BTC", icon: "₿" },
  USDC: { name: "USD Coin", symbol: "USDC", icon: "$" },
} as const

export const CRYPTO_NETWORKS = {
  BSC: { name: "BNB Smart Chain", chain: "BSC" },
  BASE: { name: "Base Network", chain: "BASE" },
  ETH: { name: "Ethereum Mainnet", chain: "ETH" },
  POLYGON: { name: "Polygon Network", chain: "POLYGON" },
  ARBITRUM: { name: "Arbitrum One", chain: "ARBITRUM" },
  OPTIMISM: { name: "Optimism", chain: "OPTIMISM" },
  BTC: { name: "Bitcoin Network", chain: "BTC" },
  TRC20: { name: "Tron (TRC20)", chain: "TRON" },
} as const

export const TRANSACTION_STATUS = {
  QuotePending: {
    label: "Quote Pending",
    color: "text-blue-100 dark:text-blue-200",
    bg: "bg-blue-600/90 dark:bg-blue-700/90",
    description: "Waiting for dealer quote",
  },
  AwaitingDeposit: {
    label: "Awaiting Deposit",
    color: "text-amber-100 dark:text-amber-200",
    bg: "bg-amber-600/90 dark:bg-amber-700/90",
    description: "Waiting for crypto deposit",
  },
  CryptoMempool: {
    label: "Incoming (Pending)",
    color: "text-amber-100 dark:text-amber-200 animate-pulse",
    bg: "bg-amber-500/90 dark:bg-amber-500/80",
    description: "Deposit detected on blockchain, pending confirmation",
  },
  CryptoConfirmed: {
    label: "Payment Approval Pending",
    color: "text-blue-100 dark:text-blue-200",
    bg: "bg-blue-600/90 dark:bg-blue-700/90",
    description: "Deposit confirmed, awaiting payout approval",
  },
  PayoutPending: {
    label: "Payout Pending",
    color: "text-purple-100 dark:text-purple-200",
    bg: "bg-purple-600/90 dark:bg-purple-700/90",
    description: "Processing Naira payout",
  },
  Settled: {
    label: "Settled",
    color: "text-emerald-100 dark:text-emerald-200",
    bg: "bg-emerald-600/90 dark:bg-emerald-700/90",
    description: "Transaction completed",
  },
  Failed: {
    label: "Failed",
    color: "text-red-100 dark:text-red-200",
    bg: "bg-red-600/90 dark:bg-red-700/90",
    description: "Transaction failed",
  },
} as const

export const QUOTE_STATUS = {
  Active: {
    label: "Active",
    color: "text-green-100 dark:text-green-200",
    bg: "bg-green-600/90 dark:bg-green-700/90",
  },
  Used: {
    label: "Used",
    color: "text-slate-100 dark:text-slate-200",
    bg: "bg-slate-600/90 dark:bg-slate-700/90",
  },
  Expired: {
    label: "Expired",
    color: "text-red-100 dark:text-red-200",
    bg: "bg-red-600/90 dark:bg-red-700/90",
  },
  Canceled: {
    label: "Canceled",
    color: "text-slate-100 dark:text-slate-200",
    bg: "bg-slate-600/90 dark:bg-slate-700/90",
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
    color: "text-amber-100 dark:text-amber-200",
    bg: "bg-amber-600/90 dark:bg-amber-700/90",
  },
  Verified: {
    label: "Verified",
    color: "text-green-100 dark:text-green-200",
    bg: "bg-green-600/90 dark:bg-green-700/90",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-100 dark:text-red-200",
    bg: "bg-red-600/90 dark:bg-red-700/90",
  },
  Suspended: {
    label: "Suspended",
    color: "text-red-100 dark:text-red-200",
    bg: "bg-red-600/90 dark:bg-red-700/90",
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

export const BUSINESS_CATEGORIES = [
  {
    group: "Professional & Technical Services",
    items: [
      { value: "it_technology", label: "IT & Technology" },
      { value: "engineering", label: "Engineering" },
      { value: "consultancy", label: "Consultancy" },
      { value: "legal_accounting", label: "Legal & Accounting" },
    ],
  },
  {
    group: "General Commerce & Trade",
    items: [
      { value: "general_merchandise", label: "General Merchandise" },
      { value: "general_contracts", label: "General Contracts" },
      { value: "retail_wholesale", label: "Retail/Wholesale Trade" },
      { value: "marketing_advertising", label: "Marketing & Advertising" },
    ],
  },
  {
    group: "Agriculture, Forestry & Fishing",
    items: [
      { value: "crop_production", label: "Crop Production" },
      { value: "animal_husbandry", label: "Animal Husbandry" },
      { value: "agro_allied", label: "Agro-Allied Services" },
    ],
  },
  {
    group: "Hospitality & Lifestyle",
    items: [
      { value: "food_beverages", label: "Food & Beverages" },
      { value: "tourism", label: "Tourism" },
      { value: "personal_services", label: "Personal Services" },
    ],
  },
  {
    group: "Construction & Real Estate",
    items: [
      { value: "building_civil", label: "Building & Civil Works" },
      { value: "specialized_construction", label: "Specialized Construction" },
      { value: "real_estate", label: "Real Estate" },
    ],
  },
  {
    group: "Manufacturing & Production",
    items: [
      { value: "food_production", label: "Food Production" },
      { value: "industrial_goods", label: "Industrial Goods" },
    ],
  },
  {
    group: "Other",
    items: [{ value: "other", label: "Other" }],
  },
] as const
