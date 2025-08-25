import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { VerificationRequestsManagement } from "@/components/admin/verification-requests-management"

async function getVerificationRequests() {
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

  // Get verification requests with business and user details
  const { data: requests, error } = await supabase
    .from("business_verification_requests")
    .select(`
      *,
      businesses!business_verification_requests_business_id_fkey(
        id,
        name,
        slug,
        address,
        phone,
        email,
        website,
        is_verified,
        categories(name)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching verification requests:", error)
    return []
  }

  const requestsWithProfiles = await Promise.all(
    (requests || []).map(async (request) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", request.requested_by)
        .single()

      return {
        ...request,
        profiles: userProfile,
      }
    }),
  )

  return requestsWithProfiles
}

export default async function VerificationRequestsPage() {
  const requests = await getVerificationRequests()

  return (
    <AdminLayout title="Business Verification Requests" searchPlaceholder="Search verification requests...">
      <VerificationRequestsManagement requests={requests} />
    </AdminLayout>
  )
}
