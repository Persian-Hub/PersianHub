import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PromotionManagement } from "@/components/admin/promotion-management"
import { Search, TrendingUp } from "lucide-react"

async function getPromotionData() {
  const supabase = createClient()

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

  // Get all promotions with business and user info
  const { data: promotions } = await supabase
    .from("promotions")
    .select(`
      *,
      businesses(name, slug, address),
      profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  // Get promotion settings
  const { data: settings } = await supabase.from("promotion_settings").select("*").eq("is_active", true).single()

  return {
    promotions: promotions || [],
    settings: settings || { promotion_cost: 10.0, promotion_duration_days: 30, currency: "USD" },
  }
}

export default async function PromotionsPage() {
  const { promotions, settings } = await getPromotionData()

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-amber-600" />
            Business Promotions
          </h1>
          <p className="text-gray-600 mt-1">Manage promotion costs and view all promotion transactions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search promotions..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <PromotionManagement promotions={promotions} settings={settings} />
    </AdminLayout>
  )
}
