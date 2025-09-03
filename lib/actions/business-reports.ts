"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { notificationService } from "@/lib/services/notification-service"

interface SubmitBusinessReportParams {
  businessId: string
  category: string
  description: string
}

export async function submitBusinessReport({ businessId, category, description }: SubmitBusinessReportParams) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Get business details for the report
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("name, owner_id")
      .eq("id", businessId)
      .single()

    if (businessError || !business) {
      return { success: false, error: "Business not found" }
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from("business_reports")
      .insert({
        business_id: businessId,
        reporter_id: user.id,
        report_category: category,
        description: description.trim(),
        status: "pending",
      })
      .select()
      .single()

    if (reportError) {
      console.error("Error creating business report:", reportError)
      return { success: false, error: "Failed to submit report" }
    }

    // Get reporter profile for email notification
    const { data: reporterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    // Send email notification to admins
    try {
      await notificationService.sendAdminBusinessReport({
        reportId: report.id,
        businessName: business.name,
        businessId: businessId,
        reportCategory: category,
        description: description.trim(),
        reporterName: reporterProfile?.full_name || "Unknown User",
        reporterEmail: reporterProfile?.email || "unknown@example.com",
      })
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError)
      // Don't fail the report submission if email fails
    }

    revalidatePath("/admin/reports")

    return { success: true, reportId: report.id }
  } catch (error) {
    console.error("Error submitting business report:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getBusinessReports() {
  try {
    const supabase = await createClient()

    const { data: reports, error } = await supabase
      .from("business_reports")
      .select(`
        *,
        businesses!business_reports_business_id_fkey(
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching business reports:", error)
      return { success: false, error: "Failed to fetch reports" }
    }

    return { success: true, reports }
  } catch (error) {
    console.error("Error fetching business reports:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateBusinessReportStatus(reportId: string, status: string, adminNotes?: string) {
  try {
    const supabase = await createClient()

    // Get current user (admin)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Verify user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return { success: false, error: "Admin access required" }
    }

    // Update the report
    const { error: updateError } = await supabase
      .from("business_reports")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (updateError) {
      console.error("Error updating business report:", updateError)
      return { success: false, error: "Failed to update report" }
    }

    revalidatePath("/admin/reports")

    return { success: true }
  } catch (error) {
    console.error("Error updating business report:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
