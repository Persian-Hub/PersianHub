import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { notFound } from "next/navigation"

async function getCategory(slug: string) {
  const supabase = createClient()

  const { data: category, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error || !category) {
    return null
  }

  return category
}

async function getCategoryBusinesses(categoryId: number) {
  const supabase = createClient()

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      profiles!owner_id(full_name)
    `)
    .eq("category_id", categoryId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching businesses:", error)
    return []
  }

  return businesses || []
}

async function getSubcategories(categoryId: number) {
  const supabase = createClient()

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("name")

  return subcategories || []
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  const [businesses, subcategories] = await Promise.all([
    getCategoryBusinesses(category.id),
    getSubcategories(category.id),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">{category.name}</h1>
          <p className="font-sans text-gray-600">
            Discover {businesses.length} Persian-owned businesses in {category.name.toLowerCase()}
          </p>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif font-semibold text-xl text-gray-900 mb-4">Subcategories</h2>
            <div className="flex flex-wrap gap-3">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-cyan-800 hover:text-cyan-800 transition-colors font-sans text-sm"
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Business Grid */}
        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="font-serif font-semibold text-xl text-gray-900 mb-2">
              No businesses found in this category
            </h3>
            <p className="font-sans text-gray-600">Be the first to add your business to this category!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
