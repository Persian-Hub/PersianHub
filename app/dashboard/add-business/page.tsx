import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AddBusinessForm } from "@/components/dashboard/add-business-form"

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

export default async function AddBusinessPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-gray-900 mb-2">Add Your Business</h1>
          <p className="font-sans text-gray-600">
            Share your Persian-owned business with the community. All listings require admin approval.
          </p>
        </div>

        <AddBusinessForm categories={categories} userId={user.id} />
      </main>

      <Footer />
    </div>
  )
}
