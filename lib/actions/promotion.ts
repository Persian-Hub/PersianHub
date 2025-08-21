"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createPromotionPayment(businessId: string) {
  const supabase = createServerActionClient({ cookies })

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Get business details
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single()

  if (businessError || !business) {
    throw new Error("Business not found or you do not have permission")
  }

  // Get current promotion settings
  const { data: settings, error: settingsError } = await supabase
    .from("promotion_settings")
    .select("*")
    .eq("is_active", true)
    .single()

  if (settingsError || !settings) {
    throw new Error("Promotion settings not found")
  }

  // Check if business already has an active promotion
  const { data: activePromotion } = await supabase
    .from("promotions")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "completed")
    .gte("promotion_end_date", new Date().toISOString())
    .single()

  if (activePromotion) {
    throw new Error("Business already has an active promotion")
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ...STRIPE_CONFIG,
      line_items: [
        {
          price_data: {
            currency: settings.currency.toLowerCase(),
            product_data: {
              name: `Promote "${business.name}"`,
              description: `Promote your business for ${settings.promotion_duration_days} days`,
            },
            unit_amount: Math.round(settings.promotion_cost * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        businessId,
        userId: user.id,
        promotionDurationDays: settings.promotion_duration_days.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/businesses/${businessId}?promotion=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/businesses/${businessId}?promotion=cancelled`,
    })

    // Create promotion record in pending status
    const { error: promotionError } = await supabase.from("promotions").insert({
      business_id: businessId,
      user_id: user.id,
      amount: settings.promotion_cost,
      currency: settings.currency,
      stripe_session_id: session.id,
      status: "pending",
    })

    if (promotionError) {
      throw new Error("Failed to create promotion record")
    }

    // Redirect to Stripe checkout
    if (session.url) {
      redirect(session.url)
    } else {
      throw new Error("Failed to create checkout session")
    }
  } catch (error) {
    console.error("Error creating promotion payment:", error)
    throw new Error("Failed to create promotion payment")
  }
}

export async function getPromotionSettings() {
  const supabase = createServerActionClient({ cookies })

  const { data: settings, error } = await supabase.from("promotion_settings").select("*").eq("is_active", true).single()

  if (error) {
    throw new Error("Failed to fetch promotion settings")
  }

  return settings
}

export async function updatePromotionSettings(promotionCost: number, promotionDurationDays: number, currency = "USD") {
  const supabase = createServerActionClient({ cookies })

  // Check if user is admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Admin access required")
  }

  // Update promotion settings
  const { error } = await supabase
    .from("promotion_settings")
    .update({
      promotion_cost: promotionCost,
      promotion_duration_days: promotionDurationDays,
      currency: currency.toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .eq("is_active", true)

  if (error) {
    throw new Error("Failed to update promotion settings")
  }

  revalidatePath("/admin/promotions")
}

export async function getBusinessPromotions(businessId?: string) {
  const supabase = createServerActionClient({ cookies })

  let query = supabase
    .from("promotions")
    .select(`
      *,
      businesses (name, slug),
      profiles (full_name, email)
    `)
    .order("created_at", { ascending: false })

  if (businessId) {
    query = query.eq("business_id", businessId)
  }

  const { data: promotions, error } = await query

  if (error) {
    throw new Error("Failed to fetch promotions")
  }

  return promotions
}
