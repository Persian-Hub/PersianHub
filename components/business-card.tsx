"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Camera } from "lucide-react"

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  images?: string[]
  is_verified: boolean
  is_sponsored: boolean
  categories?: { name: string; slug: string }
  subcategories?: { name: string; slug: string }
  opening_hours?: Record<string, string>
  phone?: string
  services?: string[]
  distance?: number
  business_services?: { service_name: string }[]
  reviews?: { rating: number }[]
  avg_rating?: number
  review_count?: number
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const services = business.business_services?.map((s) => s.service_name) || []
  const avgRating = business.avg_rating || 0
  const reviewCount = business.review_count || 0

  const distance = business.distance ? `${business.distance.toFixed(1)} km away` : "Distance unavailable"

  const getCurrentDayHours = () => {
    if (!business.opening_hours) return null
    const today = new Date().toLocaleLowerCase().slice(0, 3) // mon, tue, etc.
    const dayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()]
    return business.opening_hours[dayKey]
  }

  const todayHours = getCurrentDayHours()
  const isOpen = todayHours && todayHours !== "closed"
  const hoursDisplay = todayHours === "closed" ? "Closed" : todayHours || "Hours not available"

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const encodedAddress = encodeURIComponent(business.address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
  }

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const phoneNumber = business.phone || ""
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`
    }
  }

  const handleViewDetail = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `/businesses/${business.slug}`
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-0">
        <div className="relative">
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
            {business.images?.[0] ? (
              <img
                src={business.images[0] || "/placeholder.svg"}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="h-12 w-12 text-gray-400" />
            )}
          </div>
          {business.is_verified && (
            <Badge className="absolute top-3 left-3 bg-teal-600 hover:bg-teal-700 text-white text-xs px-2 py-1">
              Verified
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{business.name}</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{business.categories?.name}</p>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-900">
                  {avgRating.toFixed(1)} ({reviewCount})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">{business.address}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{hoursDisplay}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Button onClick={handleViewDetail} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Details
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCall} className="text-gray-700 border-gray-300 bg-transparent">
                Call Now
              </Button>
              <Button
                variant="outline"
                onClick={handleDirections}
                className="text-gray-700 border-gray-300 bg-transparent"
              >
                Direction
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
