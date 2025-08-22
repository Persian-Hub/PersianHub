import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Clock, BarChart3, MapPin } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { GoogleMap } from "@/components/ui/google-map"
import { ImageGallery } from "@/components/ui/image-gallery"
import { BusinessActions } from "@/components/business-actions"
import { ReviewForm } from "@/components/review-form"
import { trackBusinessView } from "@/lib/analytics"

async function getBusiness(slug: string) {
  const supabase = createClient()

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      description,
      address,
      phone,
      email,
      website,
      latitude,
      longitude,
      images,
      opening_hours,
      is_verified,
      is_promoted,
      is_sponsored,
      status,
      created_at,
      categories(name, slug),
      subcategories(name, slug),
      profiles!owner_id(full_name),
      business_services(service_name)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single()

  if (error || !business) {
    return null
  }

  return business
}

async function getBusinessReviews(businessId: string) {
  const supabase = createClient()

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles!reviewer_id(full_name)
    `)
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return reviews || []
}

function calculateAverageRating(reviews: any[]) {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.length).toFixed(1)
}

function formatOpeningHours(openingHours: any) {
  console.log("[v0] Opening hours data:", openingHours)

  if (!openingHours || typeof openingHours !== "object") return null

  const dayMap = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  }

  return Object.entries(dayMap).map(([abbrev, fullName]) => {
    const dayData = openingHours[abbrev]
    console.log(`[v0] ${abbrev} (${fullName}) data:`, dayData)

    let hours = "Closed"

    if (dayData) {
      // Handle structured format: {open: "09:00", close: "17:00", closed: false}
      if (typeof dayData === "object" && dayData.hasOwnProperty("closed")) {
        if (dayData.closed === true) {
          hours = "Closed"
        } else if (dayData.open && dayData.close) {
          hours = `${dayData.open} - ${dayData.close}`
        }
      }
      // Handle string format: "09:00 - 17:00" or "closed"
      else if (typeof dayData === "string") {
        hours = dayData === "closed" ? "Closed" : dayData
      }
    }

    return {
      day: fullName,
      hours: hours,
    }
  })
}

export default async function BusinessPage({
  params,
}: {
  params: { slug: string }
}) {
  const business = await getBusiness(params.slug)

  if (!business) {
    notFound()
  }

  await trackBusinessView(business.id)

  const reviews = await getBusinessReviews(business.id)
  const averageRating = calculateAverageRating(reviews)
  const formattedHours = formatOpeningHours(business.opening_hours)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back to Directory */}
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={business.images || []} businessName={business.name} />

            {/* Business Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-blue-600 font-medium">{business.categories?.name}</span>
                    {business.is_verified && <Badge className="bg-teal-600 text-white text-xs">Verified</Badge>}
                    {business.is_promoted && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs">
                        Promoted
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(Number(averageRating))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{averageRating}</span>
                    <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              {business.description && <p className="text-gray-600 mb-6">{business.description}</p>}

              {/* Services & Offerings */}
              {business.business_services && business.business_services.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Services & Offerings</h3>
                  <ul className="space-y-1">
                    {business.business_services.map((service: any, index: number) => (
                      <li key={index} className="text-gray-600">
                        • {service.service_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Business Actions */}
              <BusinessActions
                phone={business.phone}
                website={business.website}
                latitude={business.latitude}
                longitude={business.longitude}
                address={business.address}
              />
            </div>

            {/* Location Map */}
            {business.latitude && business.longitude && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Location</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <GoogleMap
                    latitude={business.latitude}
                    longitude={business.longitude}
                    businessName={business.name}
                    address={business.address}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {business.address}
                </p>
              </div>
            )}

            {/* Customer Reviews */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Customer Reviews</h3>

              <div className="mb-6">
                <ReviewForm businessId={business.id} />
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.profiles?.full_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to leave a review!</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 block">Address</span>
                  <p className="font-medium">{business.address}</p>
                </div>

                {business.phone && (
                  <div>
                    <span className="text-sm text-gray-500 block">Phone</span>
                    <p className="font-medium text-blue-600">{business.phone}</p>
                  </div>
                )}

                {business.email && (
                  <div>
                    <span className="text-sm text-gray-500 block">Email</span>
                    <p className="font-medium text-blue-600">{business.email}</p>
                  </div>
                )}

                {business.website && (
                  <div>
                    <span className="text-sm text-gray-500 block">Website</span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Visit Website ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {formattedHours && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">Business Hours</h3>
                </div>

                <div className="space-y-2">
                  {formattedHours.map((dayInfo) => (
                    <div key={dayInfo.day} className="flex justify-between">
                      <span className="text-gray-600">{dayInfo.day}</span>
                      <span className={`font-medium ${dayInfo.hours === "Closed" ? "text-red-600" : "text-green-600"}`}>
                        {dayInfo.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Statistics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Business Statistics</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium">{averageRating}/5.0</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{new Date(business.created_at).getFullYear()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Services Offered</span>
                  <span className="font-medium">{business.business_services?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
