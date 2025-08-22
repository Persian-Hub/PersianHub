"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleMapProps {
  latitude: number
  longitude: number
  businessName: string
  address: string
  className?: string
}

const MAP_ID = "5ba0cee0da187a56483a0d90"

export function GoogleMap({ latitude, longitude, businessName, address, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Basic validation
    if (latitude == null || longitude == null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    function waitForGoogleMaps() {
      const checkGoogleMaps = () => {
        if (cancelled) return

        if (window.google?.maps) {
          initMap()
        } else {
          // Wait for the gmaps:loaded event from GoogleMapsLoader
          const handleMapsLoaded = () => {
            if (!cancelled && window.google?.maps) {
              initMap()
            }
          }

          window.addEventListener("gmaps:loaded", handleMapsLoaded, { once: true })

          // Fallback: poll for Google Maps availability
          const pollInterval = setInterval(() => {
            if (cancelled) {
              clearInterval(pollInterval)
              return
            }

            if (window.google?.maps) {
              clearInterval(pollInterval)
              window.removeEventListener("gmaps:loaded", handleMapsLoaded)
              initMap()
            }
          }, 100)

          // Timeout after 10 seconds
          setTimeout(() => {
            if (!cancelled && isLoading) {
              clearInterval(pollInterval)
              window.removeEventListener("gmaps:loaded", handleMapsLoaded)
              console.error("[GoogleMap] Google Maps failed to load within timeout")
              setHasError(true)
              setIsLoading(false)
            }
          }, 10000)
        }
      }

      checkGoogleMaps()
    }

    function initMap() {
      try {
        if (cancelled) return
        const container = mapRef.current
        if (!container) throw new Error("Map container not available")
        if (!window.google?.maps) throw new Error("Google Maps not available")

        const position = { lat: latitude, lng: longitude }
        const map = new window.google.maps.Map(container, {
          center: position,
          zoom: 16,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapId: MAP_ID,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
        })

        // AdvancedMarkerElement if present (because we loaded libraries=marker)
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          const markerEl = document.createElement("div")
          markerEl.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#1C39BB"/>
            </svg>
          `
          markerEl.style.cursor = "pointer"

          const AdvancedMarker = window.google.maps.marker.AdvancedMarkerElement
          const am = new AdvancedMarker({
            map,
            position,
            content: markerEl,
            title: businessName,
          })

          const info = new window.google.maps.InfoWindow({
            content: `
              <div style="padding:8px;max-width:220px;">
                <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${businessName}</h3>
                <p style="margin:0;font-size:12px;color:#666;">${address}</p>
              </div>
            `,
          })
          am.addListener("click", () => info.open(map, am))
        } else {
          // Classic marker fallback
          const marker = new window.google.maps.Marker({
            map,
            position,
            title: businessName,
          })
          const info = new window.google.maps.InfoWindow({
            content: `
              <div style="padding:8px;max-width:220px;">
                <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${businessName}</h3>
                <p style="margin:0;font-size:12px;color:#666;">${address}</p>
              </div>
            `,
          })
          marker.addListener("click", () => info.open(map, marker))
        }

        setIsLoading(false)
      } catch (e) {
        console.error("[GoogleMap] init failed:", e)
        setHasError(true)
        setIsLoading(false)
      }
    }

    waitForGoogleMaps()

    return () => {
      cancelled = true
    }
  }, [latitude, longitude, businessName, address])

  // Always render the container so the ref exists
  return (
    <div className={`relative aspect-[2/1] rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="absolute inset-0" />

      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100/70 backdrop-blur-xs flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p>Loading map…</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="font-semibold text-gray-700 mb-2">{businessName}</p>
            <p className="text-sm text-gray-600 mb-4">{address}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open in Google Maps
              </a>
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Open in Apple Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
