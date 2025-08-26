"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"

declare global {
  interface Window {
    google?: any
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, placeDetails?: any, isValid?: boolean) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className,
  disabled = false,
  required = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSelectedPlace, setLastSelectedPlace] = useState<any>(null)
  const [lastSelectedAddress, setLastSelectedAddress] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState<"success" | "warning">("success")
  const [isPlaceSelecting, setIsPlaceSelecting] = useState(false)
  const [isValidAddress, setIsValidAddress] = useState(false)

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places) {
        console.log("[PersianHub] Google Maps Places API loaded successfully")
        setIsLoaded(true)
        return true
      }
      return false
    }

    if (checkGoogleMaps()) return

    const handleMapsLoaded = () => {
      console.log("[PersianHub] Received gmaps:loaded event")
      checkGoogleMaps()
    }

    window.addEventListener("gmaps:loaded", handleMapsLoaded)

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

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current || disabled) return

    console.log("[PersianHub] Initializing Google Places Autocomplete")

    try {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "au" },
        fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
        types: ["address"],
      })
      autocompleteRef.current = ac

      const handlePlaceChanged = () => {
        console.log("[PersianHub] Place changed event triggered")
        setIsPlaceSelecting(true)

        const place = ac.getPlace()
        console.log("[PersianHub] Place details:", {
          hasFormattedAddress: !!place?.formatted_address,
          hasGeometry: !!place?.geometry,
          hasLocation: !!place?.geometry?.location,
          placeId: place?.place_id,
        })

        if (place?.formatted_address && place?.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()

          console.log("[PersianHub] Successfully extracted coordinates:", { lat, lng, address: place.formatted_address })

          setLastSelectedPlace(place)
          setLastSelectedAddress(place.formatted_address)
          setFeedbackType("success")
          setShowFeedback(true)
          setIsValidAddress(true)

          onChange(place.formatted_address, place, true)

          setTimeout(() => {
            setIsPlaceSelecting(false)
          }, 100)

          setTimeout(() => {
            setShowFeedback(false)
          }, 3000)
        } else {
          console.log("[PersianHub] Place selection incomplete - missing address or coordinates")
          setFeedbackType("warning")
          setShowFeedback(true)
          setIsValidAddress(false)
          setIsPlaceSelecting(false)
          
          onChange(value, null, false)

          setTimeout(() => {
            setShowFeedback(false)
          }, 3000)
        }
      }

      const listener = ac.addListener("place_changed", handlePlaceChanged)

      return () => {
        if (listener?.remove) listener.remove()
        autocompleteRef.current = null
      }
    } catch (error) {
      console.error("[PersianHub] Error initializing Google Places Autocomplete:", error)
    }
  }, [isLoaded, disabled, onChange, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log("[PersianHub] Input change:", { newValue, isPlaceSelecting, lastSelectedAddress })

    if (isPlaceSelecting) {
      console.log("[PersianHub] Ignoring input change - place selection in progress")
      return
    }

    if (newValue === lastSelectedAddress && lastSelectedPlace) {
      console.log("[PersianHub] Input matches selected address, preserving place details")
      onChange(newValue, lastSelectedPlace, true)
      setIsValidAddress(true)
    } else {
      if (newValue !== lastSelectedAddress) {
        console.log("[PersianHub] Input differs from selected address, clearing place details")
        setLastSelectedPlace(null)
        setLastSelectedAddress("")
        setIsValidAddress(false)
      }
      onChange(newValue, null, false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && autocompleteRef.current) {
      const predictions = document.querySelector(".pac-container") as HTMLElement | null
      if (predictions && predictions.style.display !== "none") {
        console.log("[PersianHub] Preventing form submit - autocomplete dropdown is open")
        e.preventDefault()
      }
    }
  }

  const hasCoordinates = lastSelectedPlace?.geometry?.location && value === lastSelectedAddress

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className ?? ""} ${
            showFeedback
              ? feedbackType === "success"
                ? "ring-2 ring-green-500 border-green-500"
                : "ring-2 ring-yellow-500 border-yellow-500"
              : ""
          }`}
          disabled={disabled || !isLoaded}
          required={required}
        />

        {!isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasCoordinates ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 p-2 border rounded-md text-sm z-10 ${
            feedbackType === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackType === "success" ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span>Address selected with coordinates</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                <span>Please select an address from the dropdown for accurate location</span>
              </>
            )}
          </div>
        </div>
      )}

      {hasCoordinates && <div className="text-xs text-green-600 mt-1">✓ Location coordinates available</div>}
    </div>
  )
}
