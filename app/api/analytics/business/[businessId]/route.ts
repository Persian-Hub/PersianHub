import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"
    const businessId = params.businessId

    console.log("[v0] Fetching analytics for business:", businessId, "range:", range)

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
      default:
        startDate.setDate(endDate.getDate() - 7)
        previousEndDate.setDate(startDate.getDate() - 1)
        previousStartDate.setDate(previousEndDate.getDate() - 7)
    }

    // Fetch current period data
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from("business_clicks")
      .select("action_type, clicked_at")
      .eq("business_id", businessId)
      .gte("clicked_at", startDate.toISOString())
      .lte("clicked_at", endDate.toISOString())

    if (currentError) {
      console.error("[v0] Error fetching current analytics:", currentError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Fetch previous period data for comparison
    const { data: previousData, error: previousError } = await supabaseAdmin
      .from("business_clicks")
      .select("action_type")
      .eq("business_id", businessId)
      .gte("clicked_at", previousStartDate.toISOString())
      .lte("clicked_at", previousEndDate.toISOString())

    if (previousError) {
      console.error("[v0] Error fetching previous analytics:", previousError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Process current period data
    const totalViews = currentData?.filter((d) => d.action_type === "view").length || 0
    const totalCalls = currentData?.filter((d) => d.action_type === "call").length || 0
    const totalDirections = currentData?.filter((d) => d.action_type === "directions").length || 0

    // Process previous period data
    const previousViews = previousData?.filter((d) => d.action_type === "view").length || 0
    const previousCalls = previousData?.filter((d) => d.action_type === "call").length || 0
    const previousDirections = previousData?.filter((d) => d.action_type === "directions").length || 0

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

    const analytics = {
      totalViews,
      totalCalls,
      totalDirections,
      dailyData: dailyDataArray,
      previousPeriod: {
        totalViews: previousViews,
        totalCalls: previousCalls,
        totalDirections: previousDirections,
      },
    }

    console.log("[v0] Analytics data:", analytics)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[v0] Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
