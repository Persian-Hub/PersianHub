import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CategoryManagement } from "@/components/admin/category-management"

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories & Subcategories Management</h1>
        <p className="text-gray-600 mt-2">
          Add, edit, and remove categories and subcategories for better organization.
        </p>
      </div>

      <CategoryManagement categories={categories} />
    </AdminLayout>
  )
}
