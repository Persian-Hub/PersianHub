import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Globe, Share } from "lucide-react"

interface Business {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  website?: string
  images?: string[]
  is_verified: boolean
  is_sponsored: boolean
  categories?: { name: string; slug: string }
  subcategories?: { name: string; slug: string }
}

interface BusinessHeaderProps {
  business: Business
}

export function BusinessHeader({ business }: BusinessHeaderProps) {
  const primaryImage = business.images?.[0] || "/placeholder.svg?height=400&width=800"

  // Mock rating data
  const rating = 4.5
  const reviewCount = 23

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="h-64 md:h-80 lg:h-96 relative overflow-hidden">
        <img src={primaryImage || "/placeholder.svg"} alt={business.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Business Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-serif font-bold text-3xl md:text-4xl">{business.name}</h1>
                <div className="flex gap-2">
                  {business.is_verified && <Badge className="bg-cyan-800 text-white">Verified</Badge>}
                  {business.is_sponsored && <Badge className="bg-amber-500 text-white">Sponsored</Badge>}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-sans font-medium">{rating}</span>
                  <span className="font-sans text-white/80">({reviewCount} reviews)</span>
                </div>

                {business.categories && <span className="font-sans text-white/80">{business.categories.name}</span>}
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-4 w-4" />
                <span className="font-sans">{business.address}</span>
              </div>
            </div>

            <div className="flex gap-3">
              {business.phone && (
                <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              )}

              {business.website && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
