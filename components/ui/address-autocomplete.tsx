// components/ui/address-autocomplete.tsx
"use client"

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
  const [isLoading, setIsLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)

  // Wait for Google Maps Places to be available.
  useEffect(() => {
    let cancelled = false

    const ready = () => !!window.google?.maps?.places
    const markReady = () => {
      if (cancelled) return
      if (ready()) {
        setIsLoaded(true)
        setIsLoading(false)
      }
    }

    if (ready()) {
      markReady()
      return
    }

    // Try the modern dynamic loader if present
    const tryImport = async () => {
      try {
        // @ts-ignore - importLibrary isn't in all types yet
        if (window.google?.maps?.importLibrary) {
          await window.google.maps.importLibrary("places")
        }
      } catch {
        /* no-op; we'll also poll */
      }
    }

    // Listen for a custom event fired by layout when the script loads (optional)
    const onScript = () => markReady()
    window.addEventListener("gmaps:loaded", onScript, { once: true })

    // Poll up to 10s for slow networks
    const start = Date.now()
    const timeoutMs = 10_000
    const tick = () => {
      if (cancelled) return
      if (ready()) {
        markReady()
      } else if (Date.now() - start < timeoutMs) {
        requestAnimationFrame(tick)
      } else {
        setIsLoading(false)
        console.error("[AddressAutocomplete] Places failed to load")
      }
    }

    tryImport()
    tick()

    return () => {
      cancelled = true
      window.removeEventListener("gmaps:loaded", onScript)
    }
  }, [])

  // Initialize the Autocomplete instance once Places is ready.
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
        // Show the green notice briefly
        const t = setTimeout(() => {
          setShowFeedback(false)
          setIsPlaceSelection(false)
        }, 2000)
        // In case component unmounts quickly
        return () => clearTimeout(t)
      }
    }

    const listener = ac.addListener("place_changed", handlePlaceChanged)

    return () => {
      if (listener?.remove) listener.remove()
      autocompleteRef.current = null
    }
  }, [isLoaded, disabled, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Avoid double-firing when Google updates the input after selection
    if (!isPlaceSelection) onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submit while user is picking a prediction
    if (e.key === "Enter" && autocompleteRef.current) {
      const pred = document.querySelector(".pac-container") as HTMLElement | null
      if (pred && pred.style.display !== "none") e.preventDefault()
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
          disabled={disabled || isLoading}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isLoaded && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Green success notice */}
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
