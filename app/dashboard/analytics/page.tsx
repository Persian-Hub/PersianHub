import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getUserBusinesses(userId: string) {
  const supabase = createClient()

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, status")
    .eq("owner_id", userId)
    .eq("status", "approved") // Only show analytics for approved businesses
    .order("name")

  if (error) {
    console.error("Error fetching businesses:", error)
    return []
  }

  return businesses || []
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { business?: string; range?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const businesses = await getUserBusinesses(user.id)

  // Default to first business if none selected
  const selectedBusinessId = searchParams.business || businesses[0]?.id
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">Business Analytics</h1>
              <p className="font-sans text-gray-600">Track engagement and performance for your businesses</p>
            </div>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
                <p className="text-gray-600 mb-4">
                  You need approved businesses to view analytics. Add a business and wait for approval to start tracking
                  engagement.
                </p>
                <Link href="/dashboard/add-business">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">Add Your First Business</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <AnalyticsDashboard
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            selectedBusiness={selectedBusiness}
            timeRange={searchParams.range || "7d"}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
