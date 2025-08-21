import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Hash function for privacy-compliant tracking
function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").substring(0, 16)
}

// Generate session ID from request headers
function generateSessionId(request: NextRequest): string {
  const userAgent = request.headers.get("user-agent") || ""
  const forwarded = request.headers.get("x-forwarded-for") || ""
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)) // Hour-based session

  return hashValue(`${userAgent}-${forwarded}-${timestamp}`)
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Analytics tracking request received")

    const body = await request.json()
    const { businessId, actionType, userId } = body

    // Validate required fields
    if (!businessId || !actionType) {
      console.log("[v0] Missing required fields:", { businessId, actionType })
      return NextResponse.json({ error: "Missing required fields: businessId and actionType" }, { status: 400 })
    }

    // Validate action type
    const validActions = ["view", "call", "directions"]
    if (!validActions.includes(actionType)) {
      console.log("[v0] Invalid action type:", actionType)
      return NextResponse.json({ error: "Invalid action type. Must be: view, call, or directions" }, { status: 400 })
    }

    // Get privacy settings
    const { data: settings } = await supabaseAdmin
      .from("analytics_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["privacy_mode", "deduplication_window_seconds"])

    const privacyMode = settings?.find((s) => s.setting_key === "privacy_mode")?.setting_value === "true"
    const deduplicationWindow = Number.parseInt(
      settings?.find((s) => s.setting_key === "deduplication_window_seconds")?.setting_value || "5",
    )

    // Generate privacy-compliant tracking data
    const sessionId = generateSessionId(request)
    const ipHash = privacyMode ? hashValue(request.ip || request.headers.get("x-forwarded-for") || "") : null
    const userAgentHash = privacyMode ? hashValue(request.headers.get("user-agent") || "") : null
    const referrerDomain = request.headers.get("referer") ? new URL(request.headers.get("referer")!).hostname : null

    // Check for recent duplicate clicks (deduplication)
    if (deduplicationWindow > 0) {
      const recentClick = await supabaseAdmin
        .from("business_clicks")
        .select("id")
        .eq("business_id", businessId)
        .eq("action_type", actionType)
        .eq("session_id", sessionId)
        .gte("clicked_at", new Date(Date.now() - deduplicationWindow * 1000).toISOString())
        .limit(1)
        .single()

      if (recentClick.data) {
        console.log("[v0] Duplicate click detected, skipping")
        return NextResponse.json({ success: true, deduplicated: true })
      }
    }

    // Insert click record
    const clickData = {
      business_id: businessId,
      action_type: actionType,
      user_id: userId || null,
      session_id: sessionId,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      referrer_domain: referrerDomain,
      clicked_at: new Date().toISOString(),
    }

    console.log("[v0] Inserting click data:", { businessId, actionType, sessionId })

    const { error: insertError } = await supabaseAdmin.from("business_clicks").insert(clickData)

    if (insertError) {
      console.error("[v0] Error inserting click:", insertError)
      return NextResponse.json({ error: "Failed to track click" }, { status: 500 })
    }

    console.log("[v0] Click tracked successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "analytics-tracking",
    timestamp: new Date().toISOString(),
  })
}
