"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

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
        <title>GemEx - OTC Trading Desk</title>
        <meta name="description" content="GemEx: Professional OTC Desk for seamless crypto and fiat trading" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`font-sans antialiased bg-[#1E1E2B] text-[#F0F0F0]`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
