import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoryManagement } from "@/components/admin/category-management"
import { Plus } from "lucide-react"

async function getCategories() {
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

  // Get all categories with subcategories
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      subcategories(*)
    `)
    .order("name", { ascending: true })

  return { categories: categories || [] }
}

export default async function CategoriesPage() {
  const { categories } = await getCategories()

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories & Subcategories</h1>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Subcategory
          </button>
        </div>
      </div>

      <CategoryManagement categories={categories} />
    </AdminLayout>
  )
}
