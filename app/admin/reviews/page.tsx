import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReviewManagement } from "@/components/admin/review-management"

async function getReviews() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Get all reviews with business and reviewer info
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      businesses(name, slug),
      profiles!reviewer_id(full_name, email)
    `)
    .order("created_at", { ascending: false })

  return { reviews: reviews || [] }
}

export default async function ReviewsPage() {
  const { reviews } = await getReviews()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-700">Review Management</h1>
          <p className="text-gray-600 mt-2">Moderate and manage user reviews</p>
        </div>

        <ReviewManagement reviews={reviews} />
      </div>
    </div>
  )
}
