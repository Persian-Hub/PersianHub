"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

export function GoogleMapsLoader() {
  const [mapsKey, setMapsKey] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Fetch the Google Maps API key from server
    fetch("/api/maps/key")
      .then((res) => res.json())
      .then((data) => setMapsKey(data.key))
      .catch((err) => console.error("Failed to load Maps API key:", err))
  }, [])

  const handleScriptReady = () => {
    // Notify client components that Maps is ready
    window.dispatchEvent(new Event("gmaps:loaded"))
  }

  if (!mounted || !mapsKey) return null

  return (
    <Script
      id="google-maps"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&v=weekly&libraries=places&loading=async`}
      onReady={handleScriptReady}
    />
  )
}
