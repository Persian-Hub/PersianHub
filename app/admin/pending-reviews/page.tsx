import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ReviewManagement } from "@/components/admin/review-management"
import { MessageSquare } from "lucide-react"

async function getPendingReviews() {
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

  // Get only pending reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      businesses(name, slug),
      profiles!reviewer_id(full_name, email)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return { reviews: reviews || [] }
}

export default async function PendingReviewsPage() {
  const { reviews } = await getPendingReviews()

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
          <p className="text-gray-500">All reviews have been reviewed.</p>
        </div>
      ) : (
        <ReviewManagement reviews={reviews} />
      )}
    </AdminLayout>
  )
}
