import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BusinessHeader } from "@/components/business-header"
import { BusinessInfo } from "@/components/business-info"
import { BusinessReviews } from "@/components/business-reviews"
import { notFound } from "next/navigation"

async function getBusiness(slug: string) {
  const supabase = createClient()

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      profiles(full_name),
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
      profiles(full_name)
    `)
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return reviews || []
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

  const reviews = await getBusinessReviews(business.id)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <BusinessHeader business={business} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <BusinessInfo business={business} />
              <BusinessReviews reviews={reviews} businessId={business.id} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Contact Card */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-serif font-semibold text-lg mb-4">Contact Information</h3>

                  {business.phone && (
                    <div className="mb-3">
                      <span className="font-sans text-sm text-gray-600">Phone</span>
                      <p className="font-sans font-medium">{business.phone}</p>
                    </div>
                  )}

                  {business.email && (
                    <div className="mb-3">
                      <span className="font-sans text-sm text-gray-600">Email</span>
                      <p className="font-sans font-medium">{business.email}</p>
                    </div>
                  )}

                  {business.website && (
                    <div className="mb-3">
                      <span className="font-sans text-sm text-gray-600">Website</span>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans font-medium text-cyan-800 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="font-sans text-sm text-gray-600">Address</span>
                    <p className="font-sans font-medium">{business.address}</p>
                  </div>
                </div>

                {/* Opening Hours */}
                {business.opening_hours && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-serif font-semibold text-lg mb-4">Opening Hours</h3>
                    <div className="space-y-2">
                      {Object.entries(business.opening_hours as Record<string, string>).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-sans text-sm text-gray-600 capitalize">{day}</span>
                          <span className="font-sans text-sm font-medium">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
