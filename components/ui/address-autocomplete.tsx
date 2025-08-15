"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { getGoogleMapsScriptUrl } from "@/lib/actions/maps"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: any) => void
  placeholder?: string
  className?: string
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
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaceSelection, setIsPlaceSelection] = useState(false)

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
        const scriptUrl = await getGoogleMapsScriptUrl()

        const script = document.createElement("script")
        script.src = scriptUrl
        script.async = true
        script.defer = true

        window.initGoogleMaps = () => {
          setIsLoaded(true)
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("Failed to load Google Maps API:", error)
      }
    }

    loadGoogleMapsAPI()
  }, [])

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "au" },
        fields: ["formatted_address", "geometry", "name"],
        types: ["address"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace()
        if (place.formatted_address) {
          setIsPlaceSelection(true)
          onChange(place.formatted_address, place)
          // Reset the flag after a short delay to allow for the state update
          setTimeout(() => setIsPlaceSelection(false), 100)
        }
      })
    }
  }, [isLoaded, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only call onChange for manual typing, not when Google Places is setting the value
    if (!isPlaceSelection) {
      onChange(e.target.value)
    }
  }

  return (
    <Input ref={inputRef} value={value} onChange={handleInputChange} placeholder={placeholder} className={className} />
  )
}
