import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { BusinessManagement } from "@/components/admin/business-management"
import { Clock } from "lucide-react"

async function getPendingBusinesses() {
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

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name, email),
      categories(name),
      subcategories(name)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending businesses:", error)
  }

  return { businesses: businesses || [] }
}

export default async function PendingBusinessesPage() {
  const { businesses } = await getPendingBusinesses()

  return (
    <AdminLayout title="Pending Businesses" searchPlaceholder="Search pending businesses...">
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Clock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending businesses</h3>
          <p className="text-gray-500">All requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              {businesses.length} business{businesses.length !== 1 ? "es" : ""} awaiting review
            </p>
          </div>
          <BusinessManagement businesses={businesses} />
        </div>
      )}
    </AdminLayout>
  )
}
