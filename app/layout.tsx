import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PromptDialog } from "@/components/ui/prompt-dialog"
import { GoogleMapsLoader } from "@/components/google-maps-loader"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Persian Hub - Discover Persian-Owned Businesses",
  description: "Explore Persian-owned businesses near you that celebrate our culture and heritage.",
  generator: "v0.app",
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster />
        <ConfirmDialog />
        <PromptDialog />
        <Analytics />
        <GoogleMapsLoader />
      </body>
    </html>
  )
}
