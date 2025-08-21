"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateBusinessPromotionStatus() {
  const supabase = createServerActionClient({ cookies })

  try {
    // Get all businesses with active promotions
    const { data: activePromotions, error: promotionsError } = await supabase
      .from("promotions")
      .select("business_id")
      .eq("status", "completed")
      .gte("promotion_end_date", new Date().toISOString())
      .lte("promotion_start_date", new Date().toISOString())

    if (promotionsError) {
      console.error("Error fetching active promotions:", promotionsError)
      return
    }

    const activeBusinessIds = activePromotions?.map((p) => p.business_id) || []

    // Update all businesses: set is_promoted to true for active promotions, false for others
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ is_promoted: false })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all businesses

    if (updateError) {
      console.error("Error updating business promotion status:", updateError)
      return
    }

    // Set is_promoted to true for businesses with active promotions
    if (activeBusinessIds.length > 0) {
      const { error: promoteError } = await supabase
        .from("businesses")
        .update({ is_promoted: true })
        .in("id", activeBusinessIds)

      if (promoteError) {
        console.error("Error promoting businesses:", promoteError)
        return
      }
    }

    // Revalidate pages that show business listings
    revalidatePath("/")
    revalidatePath("/businesses")
    revalidatePath("/dashboard")

    console.log(`Updated promotion status for ${activeBusinessIds.length} businesses`)
  } catch (error) {
    console.error("Error in updateBusinessPromotionStatus:", error)
  }
}

export async function getPromotedBusinesses() {
  const supabase = createServerActionClient({ cookies })

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      business_services(service_name),
      reviews(rating)
    `)
    .eq("status", "approved")
    .eq("is_promoted", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promoted businesses:", error)
    return []
  }

  return businesses || []
}
