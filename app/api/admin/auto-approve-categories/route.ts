import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request or admin request
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // Check if it's a cron job with secret
    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`

    let isAdmin = false
    if (!isCronJob) {
      // Check if it's an admin user
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      isAdmin = profile?.role === "admin"

      if (!isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    }

    // Create admin client to bypass RLS
    const supabase = createClient()

    console.log("[v0] Starting auto-approval process...")

    // Get all pending category requests grouped by category name
    const { data: pendingRequests, error: fetchError } = await supabase
      .from("category_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (fetchError) {
      console.error("[v0] Error fetching pending requests:", fetchError)
      throw fetchError
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      console.log("[v0] No pending category requests found")
      return NextResponse.json({
        message: "No pending requests to process",
        processed: 0,
        approved: 0,
      })
    }

    // Group requests by category name (case-insensitive)
    const groupedRequests = pendingRequests.reduce(
      (acc, request) => {
        const categoryKey = request.proposed_category_name.toLowerCase().trim()
        if (!acc[categoryKey]) {
          acc[categoryKey] = []
        }
        acc[categoryKey].push(request)
        return acc
      },
      {} as Record<string, typeof pendingRequests>,
    )

    let totalProcessed = 0
    let totalApproved = 0
    const results = []

    // Process each category group
    for (const [categoryKey, requests] of Object.entries(groupedRequests)) {
      const categoryName = requests[0].proposed_category_name
      const requestCount = requests.length

      // Get search analytics for this category
      const { data: searchAnalytics } = await supabase
        .from("category_search_analytics")
        .select("search_count")
        .eq("search_term", categoryKey)
        .single()

      const searchCount = searchAnalytics?.search_count || 0

      console.log(`[v0] Checking category "${categoryName}": ${requestCount} requests, ${searchCount} searches`)

      // Check if it meets auto-approval thresholds
      const meetsThreshold = requestCount >= 10 || searchCount >= 100

      if (meetsThreshold) {
        console.log(
          `[v0] Auto-approving category "${categoryName}" (${requestCount} requests, ${searchCount} searches)`,
        )

        try {
          // Create the category
          const { data: newCategory, error: categoryError } = await supabase
            .from("categories")
            .insert({
              name: categoryName
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" "),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (categoryError && !categoryError.message.includes("duplicate key")) {
            console.error(`[v0] Error creating category "${categoryName}":`, categoryError)
            continue
          }

          // Get the category ID (either newly created or existing)
          let categoryId = newCategory?.id
          if (!categoryId) {
            const { data: existingCategory } = await supabase
              .from("categories")
              .select("id")
              .ilike("name", categoryName)
              .single()
            categoryId = existingCategory?.id
          }

          // Create subcategories if any requests have them
          const subcategoriesCreated = []
          for (const request of requests) {
            if (request.proposed_subcategory_name && categoryId) {
              const subcategoryName = request.proposed_subcategory_name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ")

              const { error: subcategoryError } = await supabase.from("subcategories").insert({
                name: subcategoryName,
                category_id: categoryId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

              if (!subcategoryError || subcategoryError.message.includes("duplicate key")) {
                subcategoriesCreated.push(subcategoryName)
              }
            }
          }

          // Mark all requests for this category as approved
          const requestIds = requests.map((r) => r.id)
          const { error: updateError } = await supabase
            .from("category_requests")
            .update({
              status: "approved",
              approved_at: new Date().toISOString(),
              admin_notes: `Auto-approved: ${requestCount} businesses requested, ${searchCount} searches. Category and ${subcategoriesCreated.length} subcategories created.`,
              updated_at: new Date().toISOString(),
            })
            .in("id", requestIds)

          if (updateError) {
            console.error(`[v0] Error updating requests for "${categoryName}":`, updateError)
            continue
          }

          totalApproved += requestCount
          results.push({
            category: categoryName,
            requests: requestCount,
            searches: searchCount,
            subcategories: subcategoriesCreated.length,
            status: "approved",
          })

          console.log(
            `[v0] Successfully auto-approved "${categoryName}" with ${subcategoriesCreated.length} subcategories`,
          )
        } catch (error) {
          console.error(`[v0] Error processing category "${categoryName}":`, error)
          results.push({
            category: categoryName,
            requests: requestCount,
            searches: searchCount,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      } else {
        console.log(
          `[v0] Category "${categoryName}" does not meet threshold (${requestCount}/10 requests, ${searchCount}/100 searches)`,
        )
        results.push({
          category: categoryName,
          requests: requestCount,
          searches: searchCount,
          status: "pending",
        })
      }

      totalProcessed += requestCount
    }

    console.log(`[v0] Auto-approval process completed: ${totalApproved}/${totalProcessed} requests approved`)

    return NextResponse.json({
      message: `Auto-approval process completed`,
      processed: totalProcessed,
      approved: totalApproved,
      results: results,
    })
  } catch (error) {
    console.error("[v0] Error in auto-approval process:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Allow GET requests for manual admin testing
export async function GET(request: NextRequest) {
  return POST(request)
}
