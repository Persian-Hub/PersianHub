"use client"

import Script from "next/script"

interface GoogleMapsLoaderProps {
  apiKey: string
}

export function GoogleMapsLoader({ apiKey }: GoogleMapsLoaderProps) {
  return (
    <Script
      id="google-maps"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&loading=async`}
      onLoad={() => {
        // notify client components that Maps is ready
        window.dispatchEvent(new Event("gmaps:loaded"))
      }}
    />
  )
}
