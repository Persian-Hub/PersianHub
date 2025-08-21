import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log("[v0] =================================")
  console.log("[v0] STRIPE WEBHOOK RECEIVED")
  console.log("[v0] Timestamp:", new Date().toISOString())
  console.log("[v0] Request URL:", req.url)
  console.log("[v0] Request method:", req.method)
  console.log("[v0] =================================")

  console.log("[v0] Stripe webhook received")

  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] Webhook signature verified successfully")
    console.log("[v0] Event type:", event.type)
    console.log("[v0] Event ID:", event.id)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerActionClient({ cookies })

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("[v0] Processing checkout.session.completed event")
        const session = event.data.object
        console.log("[v0] Session ID:", session.id)
        console.log("[v0] Session metadata:", session.metadata)

        const { businessId, userId, promotionDurationDays } = session.metadata!

        if (!businessId || !userId) {
          console.error("[v0] Missing required metadata:", { businessId, userId })
          return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
        }

        console.log("[v0] Processing promotion for business:", businessId, "user:", userId)

        // Get promotion settings for duration
        console.log("[v0] Fetching promotion settings")
        const { data: settings, error: settingsError } = await supabase
          .from("promotion_settings")
          .select("promotion_duration_days")
          .eq("is_active", true)
          .single()

        if (settingsError) {
          console.error("[v0] Error fetching promotion settings:", settingsError)
        }

        const durationDays = settings?.promotion_duration_days || Number.parseInt(promotionDurationDays) || 30
        console.log("[v0] Promotion duration days:", durationDays)

        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + durationDays)

        console.log("[v0] Promotion dates:", { startDate: startDate.toISOString(), endDate: endDate.toISOString() })

        // Update promotion record
        console.log("[v0] Updating promotion record for session:", session.id)
        const { error: updateError, data: updatedPromotion } = await supabase
          .from("promotions")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            promotion_start_date: startDate.toISOString(),
            promotion_end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id)
          .select()

        if (updateError) {
          console.error("[v0] Error updating promotion:", updateError)
          return NextResponse.json({ error: "Database update failed" }, { status: 500 })
        }

        console.log("[v0] Promotion updated successfully:", updatedPromotion)

        // Update business is_promoted flag
        console.log("[v0] Updating business promotion status for business:", businessId)
        const { error: businessError, data: updatedBusiness } = await supabase
          .from("businesses")
          .update({
            is_promoted: true,
          })
          .eq("id", businessId)
          .select()

        if (businessError) {
          console.error("[v0] Error updating business promotion status:", businessError)
          return NextResponse.json({ error: "Business update failed" }, { status: 500 })
        }

        console.log("[v0] Business promotion status updated successfully:", updatedBusiness)
        console.log("[v0] Promotion activation completed successfully")

        break
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        console.log("[v0] Processing failed/expired payment event:", event.type)
        const session = event.data.object
        const sessionId = "id" in session ? session.id : session.metadata?.session_id

        console.log("[v0] Session ID for failed payment:", sessionId)

        if (sessionId) {
          // Update promotion record to failed
          const { error: failError } = await supabase
            .from("promotions")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", sessionId)

          if (failError) {
            console.error("[v0] Error updating failed promotion:", failError)
          } else {
            console.log("[v0] Promotion marked as failed successfully")
          }
        }
        break
      }

      default:
        console.log(`[v0] Unhandled event type: ${event.type}`)
    }

    console.log("[v0] Webhook processing completed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  console.log("[v0] Webhook endpoint GET request received")
  return NextResponse.json({
    message: "Stripe webhook endpoint is active",
    timestamp: new Date().toISOString(),
    url: "/api/webhooks/stripe",
  })
}
