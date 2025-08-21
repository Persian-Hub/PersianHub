import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const categoryFilter = searchParams.get("category")
    const cityFilter = searchParams.get("city")

    console.log("[v0] Fetching global analytics:", { range, categoryFilter, cityFilter })

    // Calculate date ranges
    const endDate = new Date()
    const startDate = new Date()
    const previousStartDate = new Date()
    const previousEndDate = new Date()

    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setDate(previousEndDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setDate(previousEndDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setDate(previousEndDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setFullYear(previousEndDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setDate(previousEndDate.getDate() - 30)
    }

    // Build query filters
    let businessFilter = ""
    const filterParams: any[] = []

    if (categoryFilter) {
      businessFilter += " AND businesses.category_id = $" + (filterParams.length + 1)
      filterParams.push(categoryFilter)
    }

    if (cityFilter) {
      businessFilter += " AND businesses.address ILIKE $" + (filterParams.length + 1)
      filterParams.push(`%${cityFilter}%`)
    }

    // Fetch current period data
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from("business_clicks")
      .select(`
        action_type,
        clicked_at,
        businesses!inner(id, name, address, categories(name))
      `)
      .gte("clicked_at", startDate.toISOString())
      .lte("clicked_at", endDate.toISOString())

    if (currentError) {
      console.error("[v0] Error fetching current analytics:", currentError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Fetch previous period data
    const { data: previousData, error: previousError } = await supabaseAdmin
      .from("business_clicks")
      .select("action_type")
      .gte("clicked_at", previousStartDate.toISOString())
      .lte("clicked_at", previousEndDate.toISOString())

    if (previousError) {
      console.error("[v0] Error fetching previous analytics:", previousError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Fetch business counts
    const { data: businessCounts, error: businessError } = await supabaseAdmin.from("businesses").select("id, status")

    if (businessError) {
      console.error("[v0] Error fetching business counts:", businessError)
      return NextResponse.json({ error: "Failed to fetch business data" }, { status: 500 })
    }

    // Process current period data
    const totalViews = currentData?.filter((d) => d.action_type === "view").length || 0
    const totalCalls = currentData?.filter((d) => d.action_type === "call").length || 0
    const totalDirections = currentData?.filter((d) => d.action_type === "directions").length || 0

    // Process previous period data
    const previousViews = previousData?.filter((d) => d.action_type === "view").length || 0
    const previousCalls = previousData?.filter((d) => d.action_type === "call").length || 0
    const previousDirections = previousData?.filter((d) => d.action_type === "directions").length || 0

    // Business statistics
    const totalBusinesses = businessCounts?.length || 0
    const activeBusinesses = businessCounts?.filter((b) => b.status === "approved").length || 0

    // Group data by day for charts
    const dailyData: Record<string, { views: number; calls: number; directions: number }> = {}

    currentData?.forEach((click) => {
      const date = new Date(click.clicked_at).toISOString().split("T")[0]
      if (!dailyData[date]) {
        dailyData[date] = { views: 0, calls: 0, directions: 0 }
      }

      switch (click.action_type) {
        case "view":
          dailyData[date].views++
          break
        case "call":
          dailyData[date].calls++
          break
        case "directions":
          dailyData[date].directions++
          break
      }
    })

    // Fill in missing dates with zero values
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { views: 0, calls: 0, directions: 0 }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Convert to array and sort by date
    const dailyDataArray = Object.entries(dailyData)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate top businesses
    const businessEngagement: Record<string, any> = {}

    currentData?.forEach((click) => {
      const business = (click as any).businesses
      if (!business) return

      const businessId = business.id
      if (!businessEngagement[businessId]) {
        businessEngagement[businessId] = {
          id: businessId,
          name: business.name,
          category: business.categories?.name || "Uncategorized",
          views: 0,
          calls: 0,
          directions: 0,
          totalEngagement: 0,
        }
      }

      switch (click.action_type) {
        case "view":
          businessEngagement[businessId].views++
          break
        case "call":
          businessEngagement[businessId].calls++
          break
        case "directions":
          businessEngagement[businessId].directions++
          break
      }
      businessEngagement[businessId].totalEngagement++
    })

    const topBusinesses = Object.values(businessEngagement)
      .sort((a: any, b: any) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10)

    // Calculate category distribution
    const categoryEngagement: Record<string, { category: string; businesses: number; engagement: number }> = {}

    currentData?.forEach((click) => {
      const business = (click as any).businesses
      if (!business) return

      const category = business.categories?.name || "Uncategorized"
      if (!categoryEngagement[category]) {
        categoryEngagement[category] = {
          category,
          businesses: 0,
          engagement: 0,
        }
      }
      categoryEngagement[category].engagement++
    })

    const categoryData = Object.values(categoryEngagement)

    const analytics = {
      totalViews,
      totalCalls,
      totalDirections,
      totalBusinesses,
      activeBusinesses,
      totalUsers: 0, // TODO: Add user count if needed
      dailyData: dailyDataArray,
      topBusinesses,
      categoryData,
      cityData: [], // TODO: Implement city analysis
      previousPeriod: {
        totalViews: previousViews,
        totalCalls: previousCalls,
        totalDirections: previousDirections,
      },
    }

    console.log("[v0] Global analytics data:", analytics)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[v0] Global analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
