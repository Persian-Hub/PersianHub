"use client"

import { Button } from "@/components/ui/button"
import { Phone, Navigation, Globe } from "lucide-react"

interface BusinessActionsProps {
  phone?: string
  website?: string
  latitude?: number
  longitude?: number
  address?: string
}

export function BusinessActions({ phone, website, latitude, longitude, address }: BusinessActionsProps) {
  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, "_self")
    }
  }

  const handleDirections = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, "_blank")
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
    }
  }

  const handleWebsite = () => {
    if (website) {
      window.open(website, "_blank")
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {phone && (
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCall}>
          <Phone className="h-4 w-4 mr-2" />
          Call Now
        </Button>
      )}

      <Button variant="outline" className="border-gray-300 bg-transparent" onClick={handleDirections}>
        <Navigation className="h-4 w-4 mr-2" />
        Get Directions
      </Button>

      {website && (
        <Button variant="outline" className="border-gray-300 bg-transparent" onClick={handleWebsite}>
          <Globe className="h-4 w-4 mr-2" />
          Visit Website
        </Button>
      )}
    </div>
  )
}
