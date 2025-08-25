"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { notificationService } from "@/lib/services/notification-service"

export async function processVerificationRequest(
  requestId: string,
  businessId: string,
  approve: boolean,
  adminNotes: string,
) {
  try {
    const supabase = await createClient()

    // Get current user and verify admin role
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, message: "Authentication required" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Admin access required" }
    }

    // Get the verification request with business details
    const { data: request, error: requestError } = await supabase
      .from("business_verification_requests")
      .select(`
        *,
        businesses!business_verification_requests_business_id_fkey(
          id,
          name,
          owner_id
        )
      `)
      .eq("id", requestId)
      .single()

    if (requestError || !request) {
      console.error("Error fetching verification request:", requestError)
      return { success: false, message: "Verification request not found" }
    }

    if (request.status !== "pending") {
      return { success: false, message: "Request has already been processed" }
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", request.requested_by)
      .single()

    // Update the verification request
    const { error: updateRequestError } = await supabase
      .from("business_verification_requests")
      .update({
        status: approve ? "approved" : "rejected",
        admin_notes: adminNotes,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateRequestError) {
      console.error("Error updating verification request:", updateRequestError)
      return { success: false, message: "Failed to update verification request" }
    }

    // If approved, update the business verification status
    if (approve) {
      const { error: businessUpdateError } = await supabase
        .from("businesses")
        .update({
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", businessId)

      if (businessUpdateError) {
        console.error("Error updating business verification status:", businessUpdateError)
        return { success: false, message: "Failed to update business verification status" }
      }
    }

    try {
      if (userProfile?.email) {
        if (approve) {
          await notificationService.sendVerificationApproved({
            businessName: request.businesses.name,
            ownerName: userProfile.full_name || "Business Owner",
            ownerEmail: userProfile.email,
            adminNotes,
          })
        } else {
          await notificationService.sendVerificationRejected({
            businessName: request.businesses.name,
            ownerName: userProfile.full_name || "Business Owner",
            ownerEmail: userProfile.email,
            adminNotes,
          })
        }
      }
    } catch (emailError) {
      console.error("Error sending notification email:", emailError)
      // Don't fail the request if email fails
    }

    revalidatePath("/admin/verification-requests")
    return {
      success: true,
      message: `Verification request ${approve ? "approved" : "rejected"} successfully`,
    }
  } catch (error) {
    console.error("Error in processVerificationRequest:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
