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

  // Get only pending businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name, email),
      categories(name),
      subcategories(name)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return { businesses: businesses || [] }
}

export default async function PendingBusinessesPage() {
  const { businesses } = await getPendingBusinesses()

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Businesses</h1>
      </div>

      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Clock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending businesses</h3>
          <p className="text-gray-500">All requests have been reviewed.</p>
        </div>
      ) : (
        <BusinessManagement businesses={businesses} />
      )}
    </AdminLayout>
  )
}
