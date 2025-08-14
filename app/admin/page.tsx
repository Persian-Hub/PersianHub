import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"

async function getAdminData() {
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

  // Get dashboard stats
  const [businessesResult, usersResult, reviewsResult, pendingBusinessesResult] = await Promise.all([
    supabase.from("businesses").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("reviews").select("id", { count: "exact" }),
    supabase.from("businesses").select("id", { count: "exact" }).eq("status", "pending"),
  ])

  return {
    stats: {
      totalBusinesses: businessesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalReviews: reviewsResult.count || 0,
      pendingBusinesses: pendingBusinessesResult.count || 0,
    },
  }
}

export default async function AdminDashboard() {
  const { stats } = await getAdminData()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Persian Hub Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your business directory platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Overview */}
          <div className="lg:col-span-2">
            <AdminStats stats={stats} />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
