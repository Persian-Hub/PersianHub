import { Building2, Star, Grid3X3 } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

async function getStats() {
  const supabase = createServerClient()

  try {
    const [businessesResult, categoriesResult] = await Promise.all([
      supabase.from("businesses").select("id", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
    ])

    return {
      totalBusinesses: businessesResult.count || 0,
      featuredBusinesses: 0, // TODO: Add featured businesses logic
      categories: categoriesResult.count || 0,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      totalBusinesses: 0,
      featuredBusinesses: 0,
      categories: 0,
    }
  }
}

export async function StatsSection() {
  const stats = await getStats()

  return (
    <section className="py-8 -mt-8 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Businesses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBusinesses}</div>
            <div className="text-sm text-gray-600">Total Businesses</div>
          </div>

          {/* Featured Businesses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.featuredBusinesses}</div>
            <div className="text-sm text-gray-600">Featured Businesses</div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Grid3X3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>
    </section>
  )
}
