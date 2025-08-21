"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Phone, Navigation, TrendingUp, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface Business {
  id: string
  name: string
  slug: string
  status: string
}

interface AnalyticsData {
  totalViews: number
  totalCalls: number
  totalDirections: number
  dailyData: Array<{
    date: string
    views: number
    calls: number
    directions: number
  }>
  previousPeriod: {
    totalViews: number
    totalCalls: number
    totalDirections: number
  }
}

interface AnalyticsDashboardProps {
  businesses: Business[]
  selectedBusinessId?: string
  selectedBusiness?: Business
  timeRange: string
}

export function AnalyticsDashboard({
  businesses,
  selectedBusinessId,
  selectedBusiness,
  timeRange,
}: AnalyticsDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBusinessId) return

    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/business/${selectedBusinessId}?range=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          console.error("Failed to fetch analytics")
          setAnalytics(null)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedBusinessId, timeRange])

  const handleBusinessChange = (businessId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("business", businessId)
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const handleTimeRangeChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", range)
    router.push(`/dashboard/analytics?${params.toString()}`)
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Select value={selectedBusinessId} onValueChange={handleBusinessChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBusiness && (
          <div className="text-sm text-gray-600">
            Analytics for <span className="font-medium">{selectedBusiness.name}</span>
          </div>
        )}
      </div>

      {analytics ? (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{analytics.totalViews.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {calculateChange(analytics.totalViews, analytics.previousPeriod.totalViews) >= 0 ? "+" : ""}
                  {calculateChange(analytics.totalViews, analytics.previousPeriod.totalViews)}% from previous period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Phone Calls</CardTitle>
                <Phone className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{analytics.totalCalls.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {calculateChange(analytics.totalCalls, analytics.previousPeriod.totalCalls) >= 0 ? "+" : ""}
                  {calculateChange(analytics.totalCalls, analytics.previousPeriod.totalCalls)}% from previous period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Directions</CardTitle>
                <Navigation className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{analytics.totalDirections.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {calculateChange(analytics.totalDirections, analytics.previousPeriod.totalDirections) >= 0 ? "+" : ""}
                  {calculateChange(analytics.totalDirections, analytics.previousPeriod.totalDirections)}% from previous
                  period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Engagement Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} name="Views" />
                    <Line type="monotone" dataKey="calls" stroke="#16a34a" strokeWidth={2} name="Calls" />
                    <Line type="monotone" dataKey="directions" stroke="#9333ea" strokeWidth={2} name="Directions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Action Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { action: "Views", count: analytics.totalViews, color: "#2563eb" },
                      { action: "Calls", count: analytics.totalCalls, color: "#16a34a" },
                      { action: "Directions", count: analytics.totalDirections, color: "#9333ea" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                No analytics data found for the selected business and time period. Data will appear once customers start
                interacting with your business listing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
