import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock } from "lucide-react"

// Mock data - will be replaced with real data from Supabase
const featuredBusinesses = [
  {
    id: "1",
    name: "Saffron Palace Restaurant",
    category: "Food & Dining",
    rating: 4.8,
    reviewCount: 124,
    address: "123 Main St, Sydney",
    image: "/placeholder.svg?height=200&width=300",
    isVerified: true,
    openingHours: "11:00 AM - 10:00 PM",
  },
  {
    id: "2",
    name: "Persepolis Hair Salon",
    category: "Health & Beauty",
    rating: 4.9,
    reviewCount: 89,
    address: "456 Beauty Ave, Melbourne",
    image: "/placeholder.svg?height=200&width=300",
    isVerified: true,
    openingHours: "9:00 AM - 7:00 PM",
  },
  {
    id: "3",
    name: "Tehran Carpets & Rugs",
    category: "Retail & Shopping",
    rating: 4.7,
    reviewCount: 67,
    address: "789 Shopping Blvd, Brisbane",
    image: "/placeholder.svg?height=200&width=300",
    isVerified: false,
    openingHours: "10:00 AM - 6:00 PM",
  },
]

export function FeaturedBusinesses() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-4">Featured Businesses</h2>
          <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
            Discover some of our community's most loved Persian-owned businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200"
            >
              <div className="relative">
                <img
                  src={business.image || "/placeholder.svg"}
                  alt={business.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {business.isVerified && (
                  <Badge className="absolute top-3 left-3 bg-cyan-800 text-white">Verified</Badge>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif font-semibold text-lg text-gray-900 group-hover:text-cyan-800 transition-colors">
                    {business.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-sans text-sm font-medium text-gray-700">{business.rating}</span>
                    <span className="font-sans text-sm text-gray-500">({business.reviewCount})</span>
                  </div>
                </div>

                <p className="font-sans text-sm text-gray-600 mb-3">{business.category}</p>

                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-sans text-sm">{business.address}</span>
                </div>

                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-sans text-sm">{business.openingHours}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
