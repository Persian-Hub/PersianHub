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
  is_promoted?: boolean
  categories?: { name: string }
  subcategories?: { name: string }
  opening_hours?: Record<string, any>
  phone?: string
  services?: string[]
  distance?: number
  business_services?: { service_name: string }[]
  reviews?: { rating: number }[]
  avg_rating?: number
  review_count?: number
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

    if (!supabase) {
      console.error("Failed to create Supabase client")
      return []
    }

    try {
      const { data: businessData, error } = await supabase
        .from("businesses")
        .select(`
          *,
          profiles!owner_id(full_name),
          categories(name),
          subcategories(name),
          business_services(service_name),
          reviews(rating),
          latitude,
          longitude,
          is_promoted
        `)
        .eq("status", "approved")
        .limit(20)

      if (error) throw error

      const businessesWithStats = (businessData || []).map((business) => {
        const reviews = business.reviews || []
        const avgRating =
          reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
        const reviewCount = reviews.length

        return {
          ...business,
          avg_rating: avgRating,
          review_count: reviewCount,
        }
      })

      return businessesWithStats
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
        console.log("[v0] User location obtained:", { latitude, longitude })
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
        const businessesWithDistance = businessData.map((business) => {
          if (business.latitude && business.longitude && !isNaN(business.latitude) && !isNaN(business.longitude)) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              business.latitude,
              business.longitude,
            )
            console.log(`[v0] Distance to ${business.name}: ${distance.toFixed(1)}km`)
            return { ...business, distance: Math.round(distance * 10) / 10 } // Round to 1 decimal place
          }
          console.log(`[v0] No coordinates for ${business.name}`)
          return { ...business, distance: 999 } // Put businesses without coordinates at the end
        })

        businessesWithDistance.sort((a, b) => {
          // Promoted businesses first
          if (a.is_promoted && !b.is_promoted) return -1
          if (!a.is_promoted && b.is_promoted) return 1

          // Then sponsored businesses
          if (a.is_sponsored && !b.is_sponsored) return -1
          if (!a.is_sponsored && b.is_sponsored) return 1

          // Then by distance
          return (a.distance || 999) - (b.distance || 999)
        })
        setBusinesses(businessesWithDistance)
      } else {
        businessData.sort((a, b) => {
          // Promoted businesses first
          if (a.is_promoted && !b.is_promoted) return -1
          if (!a.is_promoted && b.is_promoted) return 1

          // Then sponsored businesses
          if (a.is_sponsored && !b.is_sponsored) return -1
          if (!a.is_sponsored && b.is_sponsored) return 1

          // Then by creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
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

  const promotedBusinesses = businesses.filter((b) => b.is_promoted)
  const regularBusinesses = businesses.filter((b) => !b.is_promoted)

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
              {promotedBusinesses.length > 0 && <span className="text-amber-600">• Promoted first</span>}
            </div>
          </div>
        </div>

        {promotedBusinesses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Promoted Businesses</h3>
              <div className="h-px bg-gradient-to-r from-amber-400 to-orange-500 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotedBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {regularBusinesses.length > 0 && (
          <div>
            {promotedBusinesses.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-semibold text-gray-900">All Businesses</h3>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {businesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No businesses found. Be the first to add your business!</p>
          </div>
        )}
      </div>
    </section>
  )
}
