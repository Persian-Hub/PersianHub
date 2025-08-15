import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Star, Building2, MessageSquare, Plus, UserPlus } from "lucide-react"

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
  const [businessesResult, usersResult, reviewsResult, pendingBusinessesResult, pendingReviewsResult] =
    await Promise.all([
      supabase.from("businesses").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reviews").select("id", { count: "exact" }),
      supabase.from("businesses").select("id", { count: "exact" }).eq("status", "pending"),
      supabase.from("reviews").select("id", { count: "exact" }).eq("status", "pending"),
    ])

  // Get recent businesses
  const { data: recentBusinesses } = await supabase
    .from("businesses")
    .select(`
      *,
      profiles!owner_id(full_name),
      categories(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    stats: {
      totalBusinesses: businessesResult.count || 0,
      totalUsers: usersResult.count || 0,
      totalReviews: reviewsResult.count || 0,
      pendingBusinesses: pendingBusinessesResult.count || 0,
      pendingReviews: pendingReviewsResult.count || 0,
      featured: 0, // TODO: Add featured businesses count
    },
    recentBusinesses: recentBusinesses || [],
  }
}

export default async function AdminDashboard() {
  const { stats, recentBusinesses } = await getAdminData()

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Review",
      value: stats.pendingBusinesses,
      icon: Clock,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Featured",
      value: stats.featured,
      icon: Star,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Businesses",
      value: stats.totalBusinesses,
      icon: Building2,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: MessageSquare,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Businesses */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Businesses</h2>

        <div className="space-y-6">
          {recentBusinesses.map((business) => (
            <Card key={business.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{business.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                      <span className="text-sm text-gray-500">{business.categories?.name || "a"}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{business.description || "test"}</p>

                {business.images && business.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Business Images</h4>
                    <img
                      src={business.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={`${business.name} main image`}
                      className="w-full max-w-md h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Business Owner</h4>
                  <p className="text-sm text-gray-600">{business.profiles?.full_name || "Admin Owned"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <p className="text-gray-600">{business.address || "aasdlkasjdasd asd asd"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600">{business.phone || "0433531131"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{business.email || "arsalan.design@gmail.com"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    <a href={business.website || "#"} className="text-blue-600 hover:underline">
                      {business.website ? "Visit Site" : "Visit Site"}
                    </a>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(business.created_at).toLocaleDateString()} • Rating: 0/5 • Reviews: 0
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
