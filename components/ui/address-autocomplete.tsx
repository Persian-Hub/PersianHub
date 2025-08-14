"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { getGoogleMapsScriptUrl } from "@/lib/actions/maps"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
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
          onChange(place.formatted_address)
        }
      })
    }
  }, [isLoaded, onChange])

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}
