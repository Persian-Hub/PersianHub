import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { BusinessList } from "@/components/dashboard/business-list"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getUserBusinesses(userId: string) {
  const supabase = createClient()

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug)
    `)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching businesses:", error)
    return []
  }

  return businesses || []
}

async function getUserReviews(userId: string) {
  const supabase = createClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      businesses!inner(name, owner_id),
      profiles!reviewer_id(full_name)
    `)
    .eq("businesses.owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return reviews || []
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [businesses, reviews] = await Promise.all([getUserBusinesses(user.id), getUserReviews(user.id)])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">Business Dashboard</h1>
            <p className="font-sans text-gray-600">Manage your Persian Hub business listings</p>
          </div>

          <Link href="/dashboard/add-business">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats businesses={businesses} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Business List */}
          <div className="lg:col-span-2">
            <BusinessList businesses={businesses} />
          </div>

          {/* Recent Reviews */}
          <div className="lg:col-span-1">
            <RecentReviews reviews={reviews} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
