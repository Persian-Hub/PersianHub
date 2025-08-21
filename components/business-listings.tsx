"use client"

import { useEffect, useState } from "react"
import { Filter, MapPin, Search } from "lucide-react"
import { BusinessCard } from "@/components/business-card"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  owner_keywords?: string[]
  _searchKeywords?: string[]
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

function calculateSearchScore(business: Business, searchTerm: string): number {
  if (!searchTerm.trim()) return 0

  const term = searchTerm.toLowerCase()
  let score = 0

  // High weight for exact name matches
  if (business.name.toLowerCase().includes(term)) {
    score += business.name.toLowerCase() === term ? 100 : 50
  }

  // Medium weight for category matches
  if (business.categories?.name.toLowerCase().includes(term)) {
    score += 30
  }

  // Medium weight for subcategory matches
  if (business.subcategories?.name.toLowerCase().includes(term)) {
    score += 25
  }

  // Medium weight for services matches
  const services = business.business_services?.map((s) => s.service_name.toLowerCase()) || []
  if (services.some((service) => service.includes(term))) {
    score += 20
  }

  // Lower weight for description matches
  if (business.description?.toLowerCase().includes(term)) {
    score += 10
  }

  // Lower weight for address matches
  if (business.address.toLowerCase().includes(term)) {
    score += 5
  }

  // Lowest weight for owner keywords matches (hidden field)
  if ((business as any)._searchKeywords?.some((keyword: string) => keyword.toLowerCase().includes(term))) {
    score += 3
  }

  return score
}

export function BusinessListings() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const updateExpiredPromotions = async () => {
    const supabase = createClient()
    if (!supabase) return

    try {
      const now = new Date().toISOString()

      // Find businesses with expired promotions
      const { data: expiredPromotions, error: fetchError } = await supabase
        .from("promotions")
        .select("business_id")
        .eq("status", "completed")
        .lt("promotion_end_date", now)

      if (fetchError) {
        console.error("[v0] Error fetching expired promotions:", fetchError)
        return
      }

      if (expiredPromotions && expiredPromotions.length > 0) {
        const businessIds = expiredPromotions.map((p) => p.business_id)

        // Update businesses to remove promotion status
        const { error: updateError } = await supabase
          .from("businesses")
          .update({ is_promoted: false })
          .in("id", businessIds)

        if (updateError) {
          console.error("[v0] Error updating expired promotions:", updateError)
        } else {
          console.log("[v0] Updated", businessIds.length, "expired promotions")
        }
      }
    } catch (error) {
      console.error("[v0] Error in updateExpiredPromotions:", error)
    }
  }

  const fetchBusinesses = async () => {
    const supabase = createClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      return []
    }

    try {
      await updateExpiredPromotions()

      const { data: businessData, error } = await supabase
        .from("businesses")
        .select(`
          id,
          name,
          slug,
          description,
          address,
          latitude,
          longitude,
          images,
          is_verified,
          is_sponsored,
          is_promoted,
          created_at,
          owner_keywords,
          opening_hours,
          profiles!owner_id(full_name),
          categories(name),
          subcategories(name),
          business_services(service_name),
          reviews(rating)
        `)
        .eq("status", "approved")
        .limit(50)

      if (error) throw error

      const businessesWithStats = (businessData || []).map((business) => {
        const reviews = business.reviews || []
        const avgRating =
          reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
        const reviewCount = reviews.length

        const { owner_keywords, ...publicBusiness } = business

        return {
          ...publicBusiness,
          avg_rating: avgRating,
          review_count: reviewCount,
          // Keep owner_keywords only for internal search scoring
          _searchKeywords: owner_keywords,
        }
      })

      const promotedCount = businessesWithStats.filter((b) => b.is_promoted).length
      console.log(`[v0] Fetched ${businessesWithStats.length} businesses, ${promotedCount} promoted`)

      return businessesWithStats
    } catch (error) {
      console.error("Error fetching businesses:", error)
      return []
    }
  }

  const searchAndFilterBusinesses = (businessData: Business[], searchTerm: string) => {
    if (!searchTerm.trim()) {
      return businessData
    }

    // Calculate search scores and filter businesses with scores > 0
    const businessesWithScores = businessData
      .map((business) => ({
        ...business,
        searchScore: calculateSearchScore(business, searchTerm),
      }))
      .filter((business) => business.searchScore > 0)

    // Sort by search relevance, then by promotion status, then by distance/date
    businessesWithScores.sort((a, b) => {
      // First by search score (higher is better)
      if (a.searchScore !== b.searchScore) {
        return b.searchScore - a.searchScore
      }

      // Then promoted businesses first
      if (a.is_promoted && !b.is_promoted) return -1
      if (!a.is_promoted && b.is_promoted) return 1

      // Then sponsored businesses
      if (a.is_sponsored && !b.is_sponsored) return -1
      if (!a.is_sponsored && b.is_sponsored) return 1

      // Finally by distance or creation date
      if (a.distance !== undefined && b.distance !== undefined) {
        return (a.distance || 999) - (b.distance || 999)
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return businessesWithScores
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
    const filtered = searchAndFilterBusinesses(businesses, searchTerm)
    setFilteredBusinesses(filtered)
  }, [businesses, searchTerm])

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

  const displayBusinesses = searchTerm.trim() ? filteredBusinesses : businesses
  const promotedBusinesses = displayBusinesses.filter((b) => b.is_promoted)
  const regularBusinesses = displayBusinesses.filter((b) => !b.is_promoted)

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
              <span>{displayBusinesses.length} results</span>
              {userLocation && !searchTerm && <span className="text-blue-600">• Sorted by distance</span>}
              {searchTerm && <span className="text-green-600">• Sorted by relevance</span>}
              {promotedBusinesses.length > 0 && <span className="text-amber-600">• Promoted first</span>}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search businesses, services, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Searching for "{searchTerm}" - {displayBusinesses.length} results found
            </p>
          )}
        </div>

        {promotedBusinesses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {searchTerm ? "Promoted Results" : "Promoted Businesses"}
              </h3>
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
                <h3 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? "Other Results" : "All Businesses"}
                </h3>
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

        {displayBusinesses.length === 0 && !loading && (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <p className="text-gray-500 mb-2">No businesses found for "{searchTerm}"</p>
                <p className="text-sm text-gray-400">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <p className="text-gray-500">No businesses found. Be the first to add your business!</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
