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
import Stripe from "stripe"

async function checkAndUpdatePromotionStatus(userId: string, businessId?: string, sessionId?: string) {
  if (!businessId) return

  console.log("[v0] Checking promotion status for business:", businessId, "session:", sessionId)

  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  let query = adminSupabase
    .from("promotions")
    .select("*")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)

  if (sessionId) {
    query = query.eq("stripe_session_id", sessionId)
  }

  const { data: pendingPromotion, error } = await query.single()

  if (error || !pendingPromotion) {
    console.log("[v0] No pending promotion found")
    return
  }

  console.log("[v0] Found pending promotion, checking Stripe session:", pendingPromotion.stripe_session_id)

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    })

    const session = await stripe.checkout.sessions.retrieve(pendingPromotion.stripe_session_id)
    console.log("[v0] Stripe session payment status:", session.payment_status)

    if (session.payment_status === "paid") {
      const { data: settings, error: settingsError } = await adminSupabase
        .from("promotion_settings")
        .select("promotion_duration_days")
        .eq("is_active", true)
        .single()

      if (settingsError) {
        console.error("[v0] Error fetching settings:", settingsError)
        return
      }

      const promotionStartDate = new Date()
      const promotionEndDate = new Date()
      promotionEndDate.setDate(promotionEndDate.getDate() + (settings?.promotion_duration_days || 30))

      console.log("[v0] Updating promotion to completed status")
      const { error: updateError } = await adminSupabase
        .from("promotions")
        .update({
          status: "completed",
          promotion_start_date: promotionStartDate.toISOString(),
          promotion_end_date: promotionEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", pendingPromotion.id)

      if (updateError) {
        console.error("[v0] Error updating promotion:", updateError)
        return
      }

      console.log("[v0] Updating business promotion status")
      const { error: businessError } = await adminSupabase
        .from("businesses")
        .update({
          is_promoted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId)

      if (businessError) {
        console.error("[v0] Error updating business:", businessError)
        return
      }

      console.log("[v0] Promotion status updated successfully")
    } else {
      console.log("[v0] Payment not completed, status:", session.payment_status)
    }
  } catch (error) {
    console.error("[v0] Error checking Stripe session:", error)
  }
}

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { promotion?: string; business?: string; session_id?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (searchParams.promotion === "success" && searchParams.business) {
    await checkAndUpdatePromotionStatus(user.id, searchParams.business, searchParams.session_id)
  }

  const [businesses, reviews] = await Promise.all([getUserBusinesses(user.id), getUserReviews(user.id)])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {searchParams.promotion === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Promotion Payment Successful!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your business promotion is now active and will appear at the top of search results.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {searchParams.promotion === "cancelled" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Promotion Payment Cancelled</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your promotion payment was cancelled. You can try again anytime.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DashboardStats businesses={businesses} />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <BusinessList businesses={businesses} />
          </div>

          <div className="lg:col-span-1">
            <RecentReviews reviews={reviews} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
