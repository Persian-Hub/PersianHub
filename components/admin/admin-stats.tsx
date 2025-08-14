import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, MessageSquare, Clock } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalBusinesses: number
    totalUsers: number
    totalReviews: number
    pendingBusinesses: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Businesses",
      value: stats.totalBusinesses,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingBusinesses,
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
