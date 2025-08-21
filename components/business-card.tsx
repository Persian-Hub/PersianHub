"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Camera, TrendingUp } from "lucide-react"

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  images?: string[]
  is_verified: boolean
  is_sponsored: boolean
  is_promoted?: boolean
  categories?: { name: string; slug: string }
  subcategories?: { name: string; slug: string }
  opening_hours?: Record<string, any>
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

  const distanceDisplay =
    business.distance !== undefined && business.distance < 999 ? `${business.distance.toFixed(1)} km away` : null

  const getCurrentDayHours = () => {
    console.log("[v0] Business:", business.name)
    console.log("[v0] Opening hours raw data:", business.opening_hours)
    console.log("[v0] Opening hours type:", typeof business.opening_hours)

    if (!business.opening_hours) {
      console.log("[v0] No opening hours data found")
      return null
    }

    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    const currentDay = dayNames[new Date().getDay()]
    const dayData = business.opening_hours[currentDay]

    console.log("[v0] Current day:", currentDay, "Day data:", dayData, "Type:", typeof dayData)

    if (!dayData) {
      console.log("[v0] No data for current day")
      return null
    }

    if (typeof dayData === "string") {
      console.log("[v0] Using string format from database")
      return dayData === "closed" ? "Closed" : dayData
    }

    if (typeof dayData === "object" && dayData.hasOwnProperty("closed")) {
      console.log("[v0] Using structured format")
      if (dayData.closed === true) {
        return "Closed"
      }
      if (dayData.open && dayData.close) {
        return `${dayData.open} - ${dayData.close}`
      }
    }

    console.log("[v0] No valid format found, returning Closed")
    return "Closed"
  }

  const todayHours = getCurrentDayHours()
  const isOpen = todayHours && todayHours !== "Closed"
  const hoursDisplay = todayHours || "Hours not available"

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
    <Card
      className={`w-full max-w-sm mx-auto bg-white shadow-sm rounded-lg overflow-hidden border ${
        business.is_promoted ? "border-amber-300 ring-2 ring-amber-200 shadow-lg" : "border-gray-200"
      }`}
    >
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

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {business.is_promoted && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs px-2 py-1 shadow-md">
                <TrendingUp className="h-3 w-3 mr-1" />
                Promoted
              </Badge>
            )}
            {business.is_verified && (
              <Badge className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-2 py-1">Verified</Badge>
            )}
          </div>
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
            <div className="flex-1">
              <span className="text-sm text-gray-600 block">{business.address}</span>
              {distanceDisplay && <span className="text-xs text-blue-600 font-medium">{distanceDisplay}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={`text-sm ${isOpen ? "text-green-600" : "text-red-600"} font-medium`}>{hoursDisplay}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={handleViewDetail}
              className={`w-full text-white ${
                business.is_promoted
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
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
