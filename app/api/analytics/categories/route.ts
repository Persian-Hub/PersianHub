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
    console.log("[v0] Fetching categories for analytics filters")

    // Fetch all categories
    const { data: categories, error } = await supabaseAdmin.from("categories").select("id, name").order("name")

    if (error) {
      console.error("[v0] Error fetching categories:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    console.log("[v0] Categories fetched successfully:", categories?.length || 0)
    return NextResponse.json(categories || [])
  } catch (error) {
    console.error("[v0] Error in categories API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
