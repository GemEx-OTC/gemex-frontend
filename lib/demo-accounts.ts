// Demo accounts for testing different user roles
export const DEMO_ACCOUNTS = {
  client: {
    email: "client@gemex.demo",
    password: "client123",
    role: "client",
    name: "Demo Client",
    redirectTo: "/client/dashboard",
  },
  dealer: {
    email: "dealer@gemex.demo",
    password: "dealer123",
    role: "dealer",
    name: "Demo Dealer",
    redirectTo: "/dealer/dashboard",
  },
  admin: {
    email: "admin@gemex.demo",
    password: "admin123",
    role: "admin",
    name: "Demo Admin",
    redirectTo: "/admin/dashboard",
  },
} as const

export type DemoAccountRole = keyof typeof DEMO_ACCOUNTS

export function validateDemoAccount(email: string, password: string) {
  const account = Object.values(DEMO_ACCOUNTS).find(
    (acc) => acc.email === email && acc.password === password
  )
  return account || null
}

export function getDemoAccountByEmail(email: string) {
  return Object.values(DEMO_ACCOUNTS).find((acc) => acc.email === email) || null
}
