"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2 } from "lucide-react"

declare global {
  interface Window {
    google?: any
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: any) => void
  placeholder?: string
  className?: string
  disabled?: boolean
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
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true)
        return true
      }
      return false
    }

    // Check if already loaded
    if (checkGoogleMaps()) return

    // Listen for the global Maps loaded event
    const handleMapsLoaded = () => {
      checkGoogleMaps()
    }

    window.addEventListener("gmaps:loaded", handleMapsLoaded)

    // Fallback: poll for Google Maps availability
    const pollInterval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(pollInterval)
      }
    }, 100)

    return () => {
      window.removeEventListener("gmaps:loaded", handleMapsLoaded)
      clearInterval(pollInterval)
    }
  }, [])

  // Initialize the Autocomplete instance
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current || disabled) return

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "au" },
      fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
      types: ["address"],
    })
    autocompleteRef.current = ac

    const handlePlaceChanged = () => {
      const place = ac.getPlace()
      if (place?.formatted_address && place?.geometry) {
        setIsPlaceSelection(true)
        setShowFeedback(true)
        onChange(place.formatted_address, place)
        setTimeout(() => {
          setShowFeedback(false)
          setIsPlaceSelection(false)
        }, 2000)
      }
    }

    const listener = ac.addListener("place_changed", handlePlaceChanged)

    return () => {
      if (listener?.remove) listener.remove()
      autocompleteRef.current = null
    }
  }, [isLoaded, disabled, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaceSelection) onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submit while selecting a prediction
    if (e.key === "Enter" && autocompleteRef.current) {
      const predictions = document.querySelector(".pac-container") as HTMLElement | null
      if (predictions && predictions.style.display !== "none") e.preventDefault()
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
          className={`${className ?? ""} ${showFeedback ? "ring-2 ring-green-500 border-green-500" : ""}`}
          disabled={disabled || !isLoaded}
        />

        {!isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

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
