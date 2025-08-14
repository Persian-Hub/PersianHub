import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock, CheckCircle, XCircle } from "lucide-react"

interface Business {
  id: string
  status: string
}

interface DashboardStatsProps {
  businesses: Business[]
}

export function DashboardStats({ businesses }: DashboardStatsProps) {
  const stats = {
    total: businesses.length,
    approved: businesses.filter((b) => b.status === "approved").length,
    pending: businesses.filter((b) => b.status === "pending").length,
    rejected: businesses.filter((b) => b.status === "rejected").length,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-sans">Total Businesses</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-sans">Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-green-600">{stats.approved}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-sans">Pending</CardTitle>
          <Clock className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-amber-600">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-sans">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-red-600">{stats.rejected}</div>
        </CardContent>
      </Card>
    </div>
  )
}
