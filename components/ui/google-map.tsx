"use client"

import { useEffect, useRef, useState } from "react"
import { getGoogleMapsScriptUrl } from "@/lib/actions/maps"

interface GoogleMapProps {
  latitude: number
  longitude: number
  businessName: string
  address: string
  className?: string
}

export function GoogleMap({ latitude, longitude, businessName, address, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const [scriptUrl, setScriptUrl] = useState<string | null>(null)

  useEffect(() => {
    getGoogleMapsScriptUrl().then(setScriptUrl).catch(console.error)
  }, [])

  useEffect(() => {
    if (!scriptUrl) return

    const initMap = () => {
      if (!mapRef.current || !window.google) return

      const position = { lat: latitude, lng: longitude }

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: position,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      new window.google.maps.Marker({
        position: position,
        map: map,
        title: businessName,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#1C39BB"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${businessName}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
          </div>
        `,
      })

      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: businessName,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      mapInstanceRef.current = map
    }

    if (window.google && window.google.maps) {
      initMap()
    } else {
      const script = document.createElement("script")
      script.src = scriptUrl
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    }

    return () => {
      // Cleanup if needed
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, businessName, address, scriptUrl])

  if (!latitude || !longitude) {
    return (
      <div className={`aspect-[2/1] bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Location not available</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={`aspect-[2/1] rounded-lg ${className}`} style={{ minHeight: "300px" }} />
}
