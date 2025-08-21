"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createPromotionPayment(businessId: string) {
  console.log("[v0] Starting promotion payment creation for business:", businessId)

  try {
    const supabase = createServerActionClient({ cookies })
    console.log("[v0] Supabase client created")

    // Get current user with better error handling
    console.log("[v0] Attempting to get user...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] User result:", { user: user?.id, error: userError?.message })

    if (userError) {
      console.error("[v0] User authentication error:", userError)
      throw new Error(`Authentication failed: ${userError.message}`)
    }

    if (!user) {
      console.error("[v0] No user found")
      throw new Error("User not authenticated")
    }

    console.log("[v0] User authenticated:", user.id)

    // Get business details
    console.log("[v0] Fetching business details...")
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single()

    console.log("[v0] Business query result:", { business: business?.name, error: businessError?.message })

    if (businessError) {
      console.error("[v0] Business query error:", businessError)
      throw new Error(`Business query failed: ${businessError.message}`)
    }

    if (!business) {
      console.error("[v0] Business not found or permission denied")
      throw new Error("Business not found or you do not have permission")
    }

    // Get current promotion settings
    console.log("[v0] Fetching promotion settings...")
    const { data: settings, error: settingsError } = await supabase
      .from("promotion_settings")
      .select("*")
      .eq("is_active", true)
      .single()

    console.log("[v0] Settings query result:", { settings: settings?.promotion_cost, error: settingsError?.message })

    if (settingsError) {
      console.error("[v0] Settings query error:", settingsError)
      throw new Error(`Settings query failed: ${settingsError.message}`)
    }

    if (!settings) {
      console.error("[v0] No active promotion settings found")
      throw new Error("Promotion settings not found")
    }

    // Check if business already has an active promotion
    console.log("[v0] Checking for active promotions...")
    const { data: activePromotion, error: promotionCheckError } = await supabase
      .from("promotions")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "completed")
      .gte("promotion_end_date", new Date().toISOString())
      .single()

    if (promotionCheckError && promotionCheckError.code !== "PGRST116") {
      console.error("[v0] Active promotion check error:", promotionCheckError)
      throw new Error(`Promotion check failed: ${promotionCheckError.message}`)
    }

    if (activePromotion) {
      console.log("[v0] Business already has active promotion")
      throw new Error("Business already has an active promotion")
    }

    // Create Stripe checkout session
    console.log("[v0] Creating Stripe checkout session...")
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

    console.log("[v0] Stripe session created:", session.id)

    // Create promotion record in pending status
    console.log("[v0] Creating promotion record...")
    const { error: promotionError } = await supabase.from("promotions").insert({
      business_id: businessId,
      user_id: user.id,
      amount: settings.promotion_cost,
      currency: settings.currency,
      stripe_session_id: session.id,
      status: "pending",
    })

    if (promotionError) {
      console.error("[v0] Promotion record creation error:", promotionError)
      throw new Error(`Failed to create promotion record: ${promotionError.message}`)
    }

    console.log("[v0] Promotion record created successfully")

    // Redirect to Stripe checkout
    if (session.url) {
      console.log("[v0] Redirecting to Stripe checkout:", session.url)
      redirect(session.url)
    } else {
      console.error("[v0] No checkout URL in session")
      throw new Error("Failed to create checkout session")
    }
  } catch (error) {
    console.error("[v0] Error in createPromotionPayment:", error)
    // Re-throw the error with more context
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Failed to create promotion payment")
    }
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

export async function updatePromotionSettings(promotionCost: number, promotionDurationDays: number, currency = "AUD") {
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
