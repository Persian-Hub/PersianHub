"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Phone } from "lucide-react"

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
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryImage = business.images?.[0] || "/placeholder.svg?height=200&width=400"

  // Mock data - will be replaced with real data
  const rating = 0
  const reviewCount = 57
  const distance = business.distance ? `${business.distance.toFixed(1)} km away` : "Distance unavailable"
  const isOpen = false
  const openTime = "9:00 AM"
  const services = business.services || ["Consultation", "Online Service", "24/7 Support", "Free Delivery"]

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
    <Card className="w-full max-w-sm mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border-0">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{business.name}</h3>
          {business.categories && <p className="text-sm text-gray-600 mb-3">{business.categories.name}</p>}

          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {rating} ({reviewCount} reviews)
            </span>
          </div>

          {business.description && <p className="text-sm text-gray-600 mb-4">{business.description}</p>}
        </div>

        <div className="mb-4 rounded-xl overflow-hidden">
          <img src={primaryImage || "/placeholder.svg"} alt={business.name} className="w-full h-48 object-cover" />
        </div>

        <div className="flex items-start mb-3">
          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">{business.address}</p>
            <p className="text-sm text-blue-600 mt-1">{distance}</p>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700">
            {isOpen ? "Open" : "Closed"} • Opens at {openTime}
          </span>
          {!isOpen && (
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700 text-xs">
              Closed
            </Badge>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">Services:</p>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {business.phone && (
          <div className="flex items-center mb-6">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">{business.phone}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleViewDetail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium"
          >
            👁️ View Details
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCall}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3 bg-transparent"
            >
              📞 Call Now
            </Button>
            <Button
              variant="outline"
              onClick={handleDirections}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3 bg-transparent"
            >
              🧭 Direction
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
