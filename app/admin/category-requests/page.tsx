import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { CategoryRequestsManagement } from "@/components/admin/category-requests-management"
import { AdminLayout } from "@/components/admin/admin-layout"

async function getCategoryRequests() {
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

  try {
    const adminClient = createAdminClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get all category requests with user and business info
    const { data: categoryRequests, error: requestsError } = await adminClient
      .from("category_requests")
      .select(`
        *,
        user_profile:profiles!category_requests_requested_by_profiles_fkey(full_name, email),
        approver_profile:profiles!category_requests_approved_by_profiles_fkey(full_name, email),
        business:businesses(name)
      `)
      .order("created_at", { ascending: false })

    // Get search analytics
    const { data: searchAnalytics, error: analyticsError } = await adminClient
      .from("category_search_analytics")
      .select("*")
      .order("search_count", { ascending: false })
      .limit(50)

    // If tables don't exist, return empty arrays
    if (requestsError && requestsError.message.includes("does not exist")) {
      console.log("Category requests tables not found, returning empty data")
      return {
        categoryRequests: [],
        searchAnalytics: [],
      }
    }

    if (requestsError) {
      console.error("Error fetching category requests:", requestsError)
    }
    if (analyticsError) {
      console.error("Error fetching search analytics:", analyticsError)
    }

    return {
      categoryRequests: categoryRequests || [],
      searchAnalytics: searchAnalytics || [],
    }
  } catch (error) {
    console.error("Error fetching category requests:", error)
    return {
      categoryRequests: [],
      searchAnalytics: [],
    }
  }
}

export default async function CategoryRequestsPage() {
  const { categoryRequests, searchAnalytics } = await getCategoryRequests()

  return (
    <AdminLayout title="Category Requests" searchPlaceholder="Search category requests...">
      <CategoryRequestsManagement categoryRequests={categoryRequests} searchAnalytics={searchAnalytics} />
    </AdminLayout>
  )
}
