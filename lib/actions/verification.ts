"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { notificationService } from "@/lib/services/notification-service"

export async function submitVerificationRequest(businessId: string, requestMessage: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, message: "Authentication required" }
    }

    // Verify user owns the business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, owner_id, is_verified")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single()

    if (businessError || !business) {
      return { success: false, message: "Business not found or access denied" }
    }

    if (business.is_verified) {
      return { success: false, message: "Business is already verified" }
    }

    // Check for existing pending request
    const { data: existingRequest } = await supabase
      .from("business_verification_requests")
      .select("id, status")
      .eq("business_id", businessId)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      return { success: false, message: "You already have a pending verification request" }
    }

    // Create verification request
    const { data: request, error: requestError } = await supabase
      .from("business_verification_requests")
      .insert({
        business_id: businessId,
        requested_by: user.id,
        request_message: requestMessage,
        status: "pending",
      })
      .select()
      .single()

    if (requestError) {
      console.error("Error creating verification request:", requestError)
      return { success: false, message: "Failed to submit verification request" }
    }

    // Get user profile for email
    const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

    // Send email notification to admin
    try {
      await notificationService.sendAdminVerificationRequest({
        businessName: business.name,
        ownerName: profile?.full_name || "Business Owner",
        ownerEmail: profile?.email || "",
        requestMessage,
        requestId: request.id,
      })
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      if (profile?.email) {
        await notificationService.sendUserVerificationConfirmation({
          businessName: business.name,
          ownerName: profile.full_name || "Business Owner",
          ownerEmail: profile.email,
        })
      }
    } catch (emailError) {
      console.error("Error sending user confirmation:", emailError)
      // Don't fail the request if email fails
    }

    revalidatePath("/dashboard")
    return { success: true, message: "Verification request submitted successfully" }
  } catch (error) {
    console.error("Error in submitVerificationRequest:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function getVerificationRequest(businessId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, data: null }
    }

    const { data: request, error } = await supabase
      .from("business_verification_requests")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching verification request:", error)
      return { success: false, data: null }
    }

    return { success: true, data: request }
  } catch (error) {
    console.error("Error in getVerificationRequest:", error)
    return { success: false, data: null }
  }
}
