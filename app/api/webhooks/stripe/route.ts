import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerActionClient({ cookies })

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { businessId, userId, promotionDurationDays } = session.metadata!

        // Get promotion settings for duration
        const { data: settings } = await supabase
          .from("promotion_settings")
          .select("promotion_duration_days")
          .eq("is_active", true)
          .single()

        const durationDays = settings?.promotion_duration_days || Number.parseInt(promotionDurationDays)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + durationDays)

        // Update promotion record
        const { error: updateError } = await supabase
          .from("promotions")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            promotion_start_date: startDate.toISOString(),
            promotion_end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id)

        if (updateError) {
          console.error("Error updating promotion:", updateError)
          return NextResponse.json({ error: "Database update failed" }, { status: 500 })
        }

        // Update business is_promoted flag
        const { error: businessError } = await supabase
          .from("businesses")
          .update({ is_promoted: true })
          .eq("id", businessId)

        if (businessError) {
          console.error("Error updating business promotion status:", businessError)
        }

        break
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object
        const sessionId = "id" in session ? session.id : session.metadata?.session_id

        if (sessionId) {
          // Update promotion record to failed
          await supabase
            .from("promotions")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", sessionId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
