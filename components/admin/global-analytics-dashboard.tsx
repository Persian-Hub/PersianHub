"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, Phone, Navigation, TrendingUp, Download, Building2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface GlobalAnalyticsData {
  totalViews: number
  totalCalls: number
  totalDirections: number
  totalBusinesses: number
  activeBusinesses: number
  totalUsers: number
  dailyData: Array<{
    date: string
    views: number
    calls: number
    directions: number
  }>
  topBusinesses: Array<{
    id: string
    name: string
    category: string
    views: number
    calls: number
    directions: number
    totalEngagement: number
  }>
  categoryData: Array<{
    category: string
    businesses: number
    engagement: number
  }>
  previousPeriod: {
    totalViews: number
    totalCalls: number
    totalDirections: number
  }
}

interface GlobalAnalyticsDashboardProps {
  timeRange: string
  categoryFilter?: string
}

export function GlobalAnalyticsDashboard({ timeRange, categoryFilter }: GlobalAnalyticsDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [analytics, setAnalytics] = useState<GlobalAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          range: timeRange,
          ...(categoryFilter && { category: categoryFilter }),
        })

        const response = await fetch(`/api/analytics/global?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          console.error("Failed to fetch global analytics")
          setAnalytics(null)
        }
      } catch (error) {
        console.error("Error fetching global analytics:", error)
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange, categoryFilter])

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const categoriesResponse = await fetch("/api/analytics/categories")

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/analytics?${params.toString()}`)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        range: timeRange,
        format: "csv",
        ...(categoryFilter && { category: categoryFilter }),
      })

      const response = await fetch(`/api/analytics/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value) => handleFilterChange("range", value)}>
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

          <Select value={categoryFilter || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {analytics ? (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Active Businesses</CardTitle>
                <Building2 className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{analytics.activeBusinesses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  of {analytics.totalBusinesses} total businesses
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Engagement Trends</CardTitle>
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
                <CardTitle className="font-sans">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="engagement"
                    >
                      {analytics.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Businesses */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Top Performing Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topBusinesses.map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{business.name}</h3>
                        <p className="text-sm text-muted-foreground">{business.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{business.views}</div>
                        <div className="text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{business.calls}</div>
                        <div className="text-muted-foreground">Calls</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{business.directions}</div>
                        <div className="text-muted-foreground">Directions</div>
                      </div>
                      <Badge variant="secondary">{business.totalEngagement} total</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-600">No analytics data available for the selected filters and time period.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
