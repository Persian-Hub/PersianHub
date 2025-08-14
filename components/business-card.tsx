import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock } from "lucide-react"

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
}

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryImage = business.images?.[0] || "/placeholder.svg?height=200&width=300"

  // Mock rating data - will be replaced with real data
  const rating = 4.5
  const reviewCount = 23

  return (
    <Link href={`/businesses/${business.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 h-full">
        <div className="relative">
          <img
            src={primaryImage || "/placeholder.svg"}
            alt={business.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {business.is_verified && <Badge className="bg-cyan-800 text-white">Verified</Badge>}
            {business.is_sponsored && <Badge className="bg-amber-500 text-white">Sponsored</Badge>}
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif font-semibold text-lg text-gray-900 group-hover:text-cyan-800 transition-colors line-clamp-2">
              {business.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-sans text-sm font-medium text-gray-700">{rating}</span>
              <span className="font-sans text-sm text-gray-500">({reviewCount})</span>
            </div>
          </div>

          {business.categories && <p className="font-sans text-sm text-cyan-800 mb-2">{business.categories.name}</p>}

          {business.description && (
            <p className="font-sans text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{business.description}</p>
          )}

          <div className="space-y-2 mt-auto">
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="font-sans text-sm line-clamp-1">{business.address}</span>
            </div>

            {business.opening_hours && (
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="font-sans text-sm">{business.opening_hours.monday || "Hours vary"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
