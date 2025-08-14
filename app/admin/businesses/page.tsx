import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BusinessManagement } from "@/components/admin/business-management"

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

  // Get all businesses with owner and category info
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name, email),
      categories(name),
      subcategories(name)
    `)
    .order("created_at", { ascending: false })

  return { businesses: businesses || [] }
}

export default async function BusinessesPage() {
  const { businesses } = await getBusinesses()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-700">Business Management</h1>
          <p className="text-gray-600 mt-2">Review and manage business listings</p>
        </div>

        <BusinessManagement businesses={businesses} />
      </div>
    </div>
  )
}
