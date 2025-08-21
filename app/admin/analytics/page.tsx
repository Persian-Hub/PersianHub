import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { GlobalAnalyticsDashboard } from "@/components/admin/global-analytics-dashboard"

async function checkAdminAccess() {
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

  return user
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string; category?: string; city?: string }
}) {
  await checkAdminAccess()

  return (
    <AdminLayout title="Global Analytics" searchPlaceholder="Search businesses, categories...">
      <GlobalAnalyticsDashboard
        timeRange={searchParams.range || "30d"}
        categoryFilter={searchParams.category}
        cityFilter={searchParams.city}
      />
    </AdminLayout>
  )
}
