import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { BusinessFilters } from "@/components/business-filters"
import { Suspense } from "react"

interface SearchParams {
  category?: string
  location?: string
  search?: string
  sort?: string
}

async function getBusinesses(searchParams: SearchParams) {
  const supabase = createClient()

  let query = supabase
    .from("businesses")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      profiles!owner_id(full_name)
    `)
    .eq("status", "approved")

  // Apply filters
  if (searchParams.category) {
    query = query.eq("categories.slug", searchParams.category)
  }

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  // Apply sorting
  switch (searchParams.sort) {
    case "name":
      query = query.order("name")
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: businesses, error } = await query

  if (error) {
    console.error("Error fetching businesses:", error)
    return []
  }

  return businesses || []
}

async function getCategories() {
  const supabase = createClient()
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return categories || []
}

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [businesses, categories] = await Promise.all([getBusinesses(searchParams), getCategories()])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">Browse Businesses</h1>
          <p className="font-sans text-gray-600">
            Discover {businesses.length} Persian-owned businesses in your community
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div>Loading filters...</div>}>
              <BusinessFilters categories={categories} searchParams={searchParams} />
            </Suspense>
          </aside>

          {/* Business Grid */}
          <div className="flex-1">
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="font-serif font-semibold text-xl text-gray-900 mb-2">No businesses found</h3>
                <p className="font-sans text-gray-600">Try adjusting your search criteria or browse all categories.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
