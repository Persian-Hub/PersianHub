import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      title: "Review Businesses",
      description: "Approve or reject business listings",
      icon: Building2,
      href: "/admin/businesses",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      title: "Moderate Reviews",
      description: "Review and moderate user feedback",
      icon: MessageSquare,
      href: "/admin/reviews",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      title: "Platform Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Button variant="ghost" className={`w-full justify-start h-auto p-4 ${action.color} transition-colors`}>
                <Icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
