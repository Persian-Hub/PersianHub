"use client"

import { useEffect, useRef, useState } from "react"
import { getGoogleMapsScriptUrl } from "@/lib/actions/maps"
import { MapPin, ExternalLink } from "lucide-react"

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
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGoogleMapsScriptUrl()
      .then(setScriptUrl)
      .catch((error) => {
        console.error("[v0] Failed to get Google Maps script URL:", error)
        setHasError(true)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!scriptUrl || hasError) return

    const initMap = async () => {
      try {
        if (!mapRef.current || !window.google) {
          setHasError(true)
          setIsLoading(false)
          return
        }

        const position = { lat: latitude, lng: longitude }

        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: position,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        })

        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // Create custom marker element
          const markerElement = document.createElement("div")
          markerElement.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2ZM16 13C14.3 13 13 11.7 13 10S14.3 7 16 7S19 8.3 19 10S17.7 13 16 13Z" fill="#1C39BB"/>
            </svg>
          `
          markerElement.style.cursor = "pointer"

          const advancedMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position: position,
            content: markerElement,
            title: businessName,
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${businessName}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
              </div>
            `,
          })

          advancedMarker.addListener("click", () => {
            infoWindow.open(map, advancedMarker)
          })
        } else {
          console.warn("[v0] AdvancedMarkerElement not available, falling back to regular Marker")

          const marker = new window.google.maps.Marker({
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

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })
        }

        mapInstanceRef.current = map
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error initializing Google Maps:", error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    const handleScriptError = () => {
      console.error("[v0] Failed to load Google Maps script")
      setHasError(true)
      setIsLoading(false)
    }

    if (window.google && window.google.maps) {
      initMap()
    } else {
      const script = document.createElement("script")
      script.src = scriptUrl
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = handleScriptError
      document.head.appendChild(script)
    }

    return () => {
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, businessName, address, scriptUrl, hasError])

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

  if (hasError) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(address)}`

    return (
      <div
        className={`aspect-[2/1] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h4 className="font-semibold text-gray-700 mb-2">{businessName}</h4>
          <p className="text-sm text-gray-600 mb-4">{address}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Apple Maps
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`aspect-[2/1] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={`aspect-[2/1] rounded-lg ${className}`} style={{ minHeight: "300px" }} />
}
