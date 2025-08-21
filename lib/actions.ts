"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { notificationService } from "@/lib/services/notification-service"
import { createAdminClient } from "@/lib/supabase/admin"

// Update the signIn function to handle redirects properly
export async function signIn(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Return success instead of redirecting directly
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Enhanced signUp function with profile creation
export async function signUp(prevState: any, formData: FormData) {
  // Check if formData is valid
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const businessOwner = formData.get("businessOwner") === "on"

  // Validate required fields
  if (!email || !password || !fullName) {
    return { error: "All fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        data: {
          full_name: fullName.toString(),
          is_business_owner: businessOwner,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createBusiness(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Extract form data
    const businessData = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      website: formData.get("website")?.toString() || "",
      category_id: formData.get("category_id")?.toString() || "",
      subcategory_id: formData.get("subcategory_id")?.toString() || null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      images: JSON.parse(formData.get("images")?.toString() || "[]"),
      opening_hours: JSON.parse(formData.get("opening_hours")?.toString() || "{}"),
      services: JSON.parse(formData.get("services")?.toString() || "[]"),
      owner_keywords: JSON.parse(formData.get("owner_keywords")?.toString() || "[]"),
    }

    // Generate unique slug
    const baseSlug = businessData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data: existingBusiness } = await supabase.from("businesses").select("id").eq("slug", slug).single()

      if (!existingBusiness) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create business with pending status
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        ...businessData,
        slug,
        owner_id: user.id,
        status: "pending", // Always start as pending
      })
      .select()
      .single()

    if (businessError) throw businessError

    // Add services if provided
    if (businessData.services.length > 0 && business) {
      const serviceInserts = businessData.services.map((service: string) => ({
        business_id: business.id,
        service_name: service,
      }))

      const { error: servicesError } = await supabase.from("business_services").insert(serviceInserts)

      if (servicesError) {
        console.error("Error adding services:", servicesError)
      }
    }

    try {
      const businessNotificationData = await notificationService.getBusinessNotificationData(business.id)
      if (businessNotificationData) {
        await notificationService.notifyBusinessSubmitted({
          ...businessNotificationData,
          actorUserId: user.id,
        })
      }
    } catch (emailError) {
      console.error("Failed to send business submission emails:", emailError)
      // Don't fail the business creation if email fails
    }

    return { success: "Business submitted successfully and is pending approval." }
  } catch (error) {
    console.error("Error creating business:", error)
    return { error: "Failed to create business. Please try again." }
  }
}

export async function updateBusinessStatus(
  businessId: string,
  status: "pending" | "approved" | "rejected",
  rejectionReason?: string,
) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get current business data to check for state changes
    const { data: currentBusiness, error: fetchError } = await supabase
      .from("businesses")
      .select("status, is_verified")
      .eq("id", businessId)
      .single()

    if (fetchError || !currentBusiness) {
      return { error: "Business not found" }
    }

    // Only proceed if status is actually changing
    if (currentBusiness.status === status) {
      return { success: "No changes made" }
    }

    // Update business status
    const updates = {
      status,
      approved_by: status !== "pending" ? user.id : null,
      approved_at: status !== "pending" ? new Date().toISOString() : null,
    }

    const { error: updateError } = await supabase.from("businesses").update(updates).eq("id", businessId)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("audit_log").insert({
      table_name: "businesses",
      record_id: businessId,
      action: status,
      user_id: user.id,
      new_values: { status, notes: rejectionReason },
    })

    try {
      const businessNotificationData = await notificationService.getBusinessNotificationData(businessId)
      if (businessNotificationData) {
        const notificationData = {
          ...businessNotificationData,
          actorUserId: user.id,
          rejectionReason,
        }

        switch (status) {
          case "approved":
            await notificationService.notifyBusinessApproved(notificationData)
            break
          case "rejected":
            if (rejectionReason) {
              await notificationService.notifyBusinessRejected(notificationData)
            }
            break
        }
      }
    } catch (emailError) {
      console.error("Failed to send business status change emails:", emailError)
      // Don't fail the status update if email fails
    }

    return { success: `Business ${status} successfully` }
  } catch (error) {
    console.error("Error updating business status:", error)
    return { error: "Failed to update business status" }
  }
}

export async function updateBusinessVerification(businessId: string, isVerified: boolean) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get current verification status to check for state changes
    const { data: currentBusiness, error: fetchError } = await supabase
      .from("businesses")
      .select("is_verified")
      .eq("id", businessId)
      .single()

    if (fetchError || !currentBusiness) {
      return { error: "Business not found" }
    }

    // Only proceed if verification status is actually changing
    if (currentBusiness.is_verified === isVerified) {
      return { success: "No changes made" }
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ is_verified: isVerified })
      .eq("id", businessId)

    if (updateError) throw updateError

    if (isVerified) {
      try {
        const businessNotificationData = await notificationService.getBusinessNotificationData(businessId)
        if (businessNotificationData) {
          await notificationService.notifyBusinessVerified({
            ...businessNotificationData,
            actorUserId: user.id,
          })
        }
      } catch (emailError) {
        console.error("Failed to send business verification email:", emailError)
        // Don't fail the verification update if email fails
      }
    }

    return { success: `Business ${isVerified ? "verified" : "unverified"} successfully` }
  } catch (error) {
    console.error("Error updating business verification:", error)
    return { error: "Failed to update business verification" }
  }
}

export async function createReview(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    const businessId = formData.get("businessId")?.toString()
    const rating = Number(formData.get("rating"))
    const comment = formData.get("comment")?.toString()

    if (!businessId || !rating || !comment) {
      return { error: "All fields are required" }
    }

    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" }
    }

    // Create review with pending status
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        business_id: businessId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim(),
        status: "pending", // Always start as pending for admin approval
      })
      .select()
      .single()

    if (reviewError) throw reviewError

    try {
      const reviewNotificationData = await notificationService.getReviewNotificationData(review.id)
      if (reviewNotificationData) {
        await notificationService.notifyReviewSubmitted({
          ...reviewNotificationData,
          actorUserId: user.id,
        })
      }
    } catch (emailError) {
      console.error("Failed to send review submission emails:", emailError)
      // Don't fail the review creation if email fails
    }

    return { success: "Review submitted successfully and is pending approval." }
  } catch (error) {
    console.error("Error creating review:", error)
    return { error: "Failed to submit review. Please try again." }
  }
}

export async function updateReviewStatus(
  reviewId: string,
  status: "pending" | "approved" | "rejected",
  moderationNotes?: string,
) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get current review data to check for state changes
    const { data: currentReview, error: fetchError } = await supabase
      .from("reviews")
      .select("status")
      .eq("id", reviewId)
      .single()

    if (fetchError || !currentReview) {
      return { error: "Review not found" }
    }

    // Only proceed if status is actually changing
    if (currentReview.status === status) {
      return { success: "No changes made" }
    }

    // Update review status
    const updates = {
      status,
      approved_by_admin_id: status !== "pending" ? user.id : null,
      approved_at: status !== "pending" ? new Date().toISOString() : null,
    }

    const { error: updateError } = await supabase.from("reviews").update(updates).eq("id", reviewId)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("audit_log").insert({
      table_name: "reviews",
      record_id: reviewId,
      action: status,
      user_id: user.id,
      new_values: { status, notes: moderationNotes },
    })

    if (status === "approved") {
      try {
        const reviewNotificationData = await notificationService.getReviewNotificationData(reviewId)
        if (reviewNotificationData) {
          await notificationService.notifyReviewApproved({
            ...reviewNotificationData,
            actorUserId: user.id,
          })
        }
      } catch (emailError) {
        console.error("Failed to send review approval email:", emailError)
        // Don't fail the status update if email fails
      }
    }

    return { success: `Review ${status} successfully` }
  } catch (error) {
    console.error("Error updating review status:", error)
    return { error: "Failed to update review status" }
  }
}

export async function sendTestEmail(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const recipient = formData.get("recipient")?.toString()
    if (!recipient) {
      return { error: "Recipient email is required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipient)) {
      return { error: "Invalid email format" }
    }

    // Import email service dynamically to avoid issues
    const { emailService } = await import("@/lib/services/email-service")

    const result = await emailService.sendTestEmail(recipient)

    if (result.success) {
      return { success: result.message }
    } else {
      return { error: result.message }
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { error: "Failed to send test email. Please check server logs for details." }
  }
}

export async function getEmailConfiguration() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    // Import email service dynamically
    const { emailService } = await import("@/lib/services/email-service")

    const config = emailService.getConfig()

    return {
      success: true,
      config: {
        host: config.host,
        port: config.port,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        adminEmails: config.adminEmails,
        baseUrl: config.baseUrl,
        isConfigured: config.isConfigured,
      },
    }
  } catch (error) {
    console.error("Error getting email configuration:", error)
    return { error: "Failed to get email configuration" }
  }
}

export async function createCategory(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const name = formData.get("name")?.toString()
    if (!name?.trim()) {
      return { error: "Category name is required" }
    }

    const adminSupabase = createAdminClient()

    // Check if category already exists
    const { data: existingCategory } = await adminSupabase
      .from("categories")
      .select("id")
      .eq("name", name.trim())
      .single()

    if (existingCategory) {
      return { error: "Category already exists" }
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await adminSupabase.from("categories").insert({ name: name.trim(), slug }).select().single()

    if (error) throw error

    return { success: "Category created successfully", data }
  } catch (error) {
    console.error("Error creating category:", error)
    return { error: "Failed to create category" }
  }
}

export async function updateCategory(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const categoryId = formData.get("categoryId")?.toString()
    const name = formData.get("name")?.toString()

    if (!categoryId || !name?.trim()) {
      return { error: "Category ID and name are required" }
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from("categories").update({ name: name.trim(), slug }).eq("id", categoryId)

    if (error) throw error

    return { success: "Category updated successfully" }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: "Failed to update category" }
  }
}

export async function deleteCategory(categoryId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const adminSupabase = createAdminClient()

    // Check if category has businesses
    const { data: businesses } = await adminSupabase
      .from("businesses")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)

    if (businesses && businesses.length > 0) {
      return { error: "Cannot delete category with existing businesses" }
    }

    const { error } = await adminSupabase.from("categories").delete().eq("id", categoryId)

    if (error) throw error

    return { success: "Category deleted successfully" }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Failed to delete category" }
  }
}

export async function createSubcategory(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const name = formData.get("name")?.toString()
    const categoryId = formData.get("categoryId")?.toString()

    if (!name?.trim() || !categoryId) {
      return { error: "Subcategory name and category are required" }
    }

    const adminSupabase = createAdminClient()

    // Check if subcategory already exists in this category
    const { data: existingSubcategory } = await adminSupabase
      .from("subcategories")
      .select("id")
      .eq("name", name.trim())
      .eq("category_id", categoryId)
      .single()

    if (existingSubcategory) {
      return { error: "Subcategory already exists in this category" }
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await adminSupabase
      .from("subcategories")
      .insert({ name: name.trim(), slug, category_id: categoryId })
      .select()
      .single()

    if (error) throw error

    return { success: "Subcategory created successfully", data }
  } catch (error) {
    console.error("Error creating subcategory:", error)
    return { error: "Failed to create subcategory" }
  }
}

export async function updateSubcategory(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const subcategoryId = formData.get("subcategoryId")?.toString()
    const name = formData.get("name")?.toString()

    if (!subcategoryId || !name?.trim()) {
      return { error: "Subcategory ID and name are required" }
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from("subcategories")
      .update({ name: name.trim(), slug })
      .eq("id", subcategoryId)

    if (error) throw error

    return { success: "Subcategory updated successfully" }
  } catch (error) {
    console.error("Error updating subcategory:", error)
    return { error: "Failed to update subcategory" }
  }
}

export async function deleteSubcategory(subcategoryId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!profile || profile.role !== "admin") {
      return { error: "Admin access required" }
    }

    const adminSupabase = createAdminClient()

    // Check if subcategory has businesses
    const { data: businesses } = await adminSupabase
      .from("businesses")
      .select("id")
      .eq("subcategory_id", subcategoryId)
      .limit(1)

    if (businesses && businesses.length > 0) {
      return { error: "Cannot delete subcategory with existing businesses" }
    }

    const { error } = await adminSupabase.from("subcategories").delete().eq("id", subcategoryId)

    if (error) throw error

    return { success: "Subcategory deleted successfully" }
  } catch (error) {
    console.error("Error deleting subcategory:", error)
    return { error: "Failed to delete subcategory" }
  }
}
