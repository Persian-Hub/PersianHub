import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BusinessManagement } from "@/components/admin/business-management"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Search } from "lucide-react"

async function getBusinesses() {
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

  // Get all businesses with owner, category info, and images
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name, email),
      categories(name),
      subcategories(name),
      images
    `)
    .order("created_at", { ascending: false })

  return { businesses: businesses || [] }
}

export default async function BusinessesPage() {
  const { businesses } = await getBusinesses()

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Businesses</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search businesses..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <BusinessManagement businesses={businesses} />
    </AdminLayout>
  )
}
