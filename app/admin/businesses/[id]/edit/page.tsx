import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditBusinessForm } from "@/components/dashboard/edit-business-form"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AdminEditBusinessPageProps {
  params: {
    id: string
  }
}

async function getBusiness(id: string) {
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

  // Get business details with all related data
  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name, email),
      categories(id, name),
      subcategories(id, name)
    `)
    .eq("id", id)
    .single()

  if (error || !business) {
    redirect("/admin/businesses")
  }

  // Get all categories and subcategories for the form
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: subcategories } = await supabase.from("subcategories").select("*").order("name")

  return {
    business,
    categories: categories || [],
    subcategories: subcategories || [],
  }
}

export default async function AdminEditBusinessPage({ params }: AdminEditBusinessPageProps) {
  const { business, categories, subcategories } = await getBusiness(params.id)

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/admin/businesses"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Businesses
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
            <p className="text-gray-600 mt-1">
              Editing: <span className="font-medium">{business.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Owner: {business.profiles?.full_name} ({business.profiles?.email})
            </p>
          </div>

          <EditBusinessForm
            business={business}
            categories={categories}
            subcategories={subcategories}
            isAdmin={true}
            redirectPath="/admin/businesses"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
