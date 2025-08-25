import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EditBusinessForm } from "@/components/dashboard/edit-business-form"

async function getBusiness(businessId: string, userId: string) {
  const supabase = createClient()

  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      *,
      business_services(service_name)
    `)
    .eq("id", businessId)
    .eq("owner_id", userId)
    .single()

  if (error || !business) {
    return null
  }

  return business
}

async function getCategories() {
  const supabase = createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      subcategories(*)
    `)
    .order("name")

  return categories || []
}

export default async function EditBusinessPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [business, categories] = await Promise.all([getBusiness(params.id, user.id), getCategories()])

  if (!business) {
    notFound()
  }

  const subcategories = categories.flatMap(
    (category) =>
      category.subcategories?.map((sub) => ({
        ...sub,
        category_id: category.id,
      })) || [],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">Edit Business</h1>
          <p className="font-sans text-gray-600">Update your business information and services.</p>
        </div>

        <EditBusinessForm business={business} categories={categories} subcategories={subcategories} />
      </main>

      <Footer />
    </div>
  )
}
