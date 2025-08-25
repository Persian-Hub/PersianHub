"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"

export function GpsNearMeButton() {
  const [gpsStatus, setGpsStatus] = useState<"unknown" | "enabled" | "disabled">("unknown")
  const [isChecking, setIsChecking] = useState(false)

  // Check GPS permission status on component mount
  useEffect(() => {
    checkGpsPermission()
  }, [])

  const checkGpsPermission = async () => {
    if (!navigator.geolocation) {
      setGpsStatus("disabled")
      return
    }

    try {
      // Check if we already have permission
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" })
        if (permission.state === "granted") {
          setGpsStatus("enabled")
        } else if (permission.state === "denied") {
          setGpsStatus("disabled")
        } else {
          setGpsStatus("disabled") // prompt state treated as disabled until granted
        }
      } else {
        // Fallback for browsers without permissions API
        setGpsStatus("disabled")
      }
    } catch (error) {
      console.log("[v0] Error checking GPS permission:", error)
      setGpsStatus("disabled")
    }
  }

  const handleNearMeClick = async () => {
    if (gpsStatus === "enabled") {
      // GPS is already enabled, proceed with location-based search
      // TODO: Implement location-based business search
      console.log("[v0] GPS enabled, searching nearby businesses")
      return
    }

    // GPS is disabled, request permission
    setIsChecking(true)

    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("[v0] GPS permission granted:", position)
            setGpsStatus("enabled")
            resolve(position)
            // TODO: Implement location-based business search with position
          },
          (error) => {
            console.log("[v0] GPS permission denied:", error)
            setGpsStatus("disabled")
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          },
        )
      })
    } catch (error) {
      console.log("[v0] Failed to get GPS permission:", error)
      setGpsStatus("disabled")
    } finally {
      setIsChecking(false)
    }
  }

  const getButtonContent = () => {
    if (isChecking) {
      return (
        <>
          <Navigation className="h-4 w-4 mr-2 animate-pulse" />
          Checking GPS...
        </>
      )
    }

    if (gpsStatus === "enabled") {
      return (
        <>
          <Navigation className="h-4 w-4 mr-2 text-green-600" />
          <span className="text-green-700">GPS Enabled</span>
        </>
      )
    }

    return (
      <>
        <MapPin className="h-4 w-4 mr-2 text-red-600" />
        <span className="text-red-700">No Access to GPS</span>
      </>
    )
  }

  return (
    <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleNearMeClick} disabled={isChecking}>
      {getButtonContent()}
    </Button>
  )
}
