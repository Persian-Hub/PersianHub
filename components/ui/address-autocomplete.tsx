"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { getGoogleMapsScriptUrl } from "@/lib/actions/maps"
import { MapPin, Loader2 } from "lucide-react"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: any) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaceSelection, setIsPlaceSelection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
        return
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return
      }

      try {
        setIsLoading(true)
        const scriptUrl = await getGoogleMapsScriptUrl()

        const script = document.createElement("script")
        script.src = scriptUrl
        script.async = true
        script.defer = true

        window.initGoogleMaps = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log("[v0] Google Maps API with Places library loaded successfully")
            setIsLoaded(true)
            setIsLoading(false)
          } else {
            console.error("[v0] Google Maps Places library not available")
            setIsLoading(false)
          }
        }

        script.onerror = () => {
          console.error("[v0] Failed to load Google Maps API script")
          setIsLoading(false)
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("Failed to load Google Maps API:", error)
        setIsLoading(false)
      }
    }

    loadGoogleMapsAPI()
  }, [])

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current && !disabled) {
      // Enhanced autocomplete configuration with better place selection handling
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "au" },
        fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
        types: ["address"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace()

        // Enhanced place validation and feedback
        if (place.formatted_address && place.geometry) {
          setIsPlaceSelection(true)
          setShowFeedback(true)

          // Preserve existing form state by only updating address-related fields
          console.log("[v0] Address selected from autocomplete:", place.formatted_address)
          onChange(place.formatted_address, place)

          // Show visual feedback for 2 seconds
          setTimeout(() => {
            setShowFeedback(false)
            setIsPlaceSelection(false)
          }, 2000)
        }
      })
    }
  }, [isLoaded, onChange, disabled])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only call onChange for manual typing, not when Google Places is setting the value
    if (!isPlaceSelection) {
      onChange(e.target.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission when selecting from autocomplete dropdown
    if (e.key === "Enter" && autocompleteRef.current) {
      const predictions = document.querySelector(".pac-container")
      if (predictions && predictions.style.display !== "none") {
        e.preventDefault()
      }
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className} ${showFeedback ? "ring-2 ring-green-500 border-green-500" : ""}`}
          disabled={disabled || isLoading}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {/* Map pin icon when loaded */}
        {isLoaded && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Visual feedback when address is selected */}
      {showFeedback && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 z-10">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>Address updated with coordinates</span>
          </div>
        </div>
      )}
    </div>
  )
}
