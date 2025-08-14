"use client"

import { useEffect, useState } from "react"
import { Filter, MapPin } from "lucide-react"
import { BusinessCard } from "@/components/business-card"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  latitude?: number
  longitude?: number
  images?: string[]
  is_verified: boolean
  is_sponsored: boolean
  categories?: { name: string }
  subcategories?: { name: string }
  opening_hours?: Record<string, string>
  phone?: string
  services?: string[]
  distance?: number
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function BusinessListings() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const fetchBusinesses = async () => {
    const supabase = createClient()

    try {
      const { data: businessData, error } = await supabase
        .from("businesses")
        .select(`
          *,
          profiles!owner_id(full_name),
          categories(name),
          subcategories(name),
          latitude,
          longitude
        `)
        .eq("status", "approved")
        .limit(20)

      if (error) throw error
      return businessData || []
    } catch (error) {
      console.error("Error fetching businesses:", error)
      return []
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationPermission("granted")
      },
      (error) => {
        console.log("Error getting location:", error)
        setLocationPermission("denied")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true)
      const businessData = await fetchBusinesses()

      if (userLocation && businessData.length > 0) {
        // Calculate distances and sort by distance
        const businessesWithDistance = businessData.map((business) => {
          if (business.latitude && business.longitude && !isNaN(business.latitude) && !isNaN(business.longitude)) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              business.latitude,
              business.longitude,
            )
            return { ...business, distance: Math.round(distance * 10) / 10 } // Round to 1 decimal place
          }
          return { ...business, distance: 999 } // Put businesses without coordinates at the end
        })

        // Sort by distance (nearest first)
        businessesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999))
        setBusinesses(businessesWithDistance)
      } else {
        setBusinesses(businessData)
      }

      setLoading(false)
    }

    loadBusinesses()
  }, [userLocation])

  useEffect(() => {
    // Try to get location on component mount
    requestLocation()
  }, [])

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading businesses...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">All Businesses</h2>
          <div className="flex items-center gap-4">
            {locationPermission === "denied" && (
              <Button
                onClick={requestLocation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <MapPin className="h-4 w-4" />
                Enable Location
              </Button>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>{businesses.length} results</span>
              {userLocation && <span className="text-blue-600">• Sorted by distance</span>}
            </div>
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No businesses found. Be the first to add your business!</p>
          </div>
        )}
      </div>
    </section>
  )
}
