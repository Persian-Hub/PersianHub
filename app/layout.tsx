import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Script from "next/script"                       // ⬅️ add this
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PromptDialog } from "@/components/ui/prompt-dialog"

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const mapsKey = process.env.GOOGLE_MAPS_BROWSER_KEY // server-only env var

  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster />
        <ConfirmDialog />
        <PromptDialog />
        <Analytics />

        {/* Load Google Maps JS once, with the Places library */}
        <Script
          id="google-maps"
          strategy="afterInteractive"
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&v=weekly&libraries=places&loading=async`}
          onLoad={() => {
            // notify client components that Maps is ready
            window.dispatchEvent(new Event("gmaps:loaded"))
          }}
        />
      </body>
    </html>
  )
}
