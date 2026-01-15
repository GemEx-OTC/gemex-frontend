"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AlertProvider } from "@/components/alert"
import { QueryProvider } from "@/lib/providers/query-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { Toaster } from "sonner"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

// Note: Metadata export cannot be used in 'use client' components
// This is a limitation of Next.js. Move metadata to a separate root layout file if needed.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>GemOTC - OTC Trading Desk</title>
        <meta name="description" content="GemOTC: Professional OTC Desk for seamless crypto and fiat trading" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <QueryProvider>
          <AuthProvider>
            <AlertProvider>
              {children}
            </AlertProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: '#1E1E2B',
              border: '1px solid #2D2D3D',
              color: '#F0F0F0',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}

