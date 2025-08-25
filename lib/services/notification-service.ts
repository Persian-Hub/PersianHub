import { emailService } from "./email-service"
import { emailTemplates } from "./email-templates"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// Notification service that handles all email notifications for Persian Hub
// Integrates with business and review workflows to send appropriate emails

interface BusinessNotificationData {
  businessId: string
  businessName: string
  ownerEmail: string
  ownerName: string
  slug?: string
  rejectionReason?: string
  actorUserId?: string
}

interface ReviewNotificationData {
  reviewId: string
  businessId: string
  businessName: string
  businessOwnerEmail: string
  businessOwnerName: string
  reviewExcerpt: string
  actorUserId?: string
}

interface UserRegistrationData {
  userId: string
  userName: string
  userEmail: string
  registeredAt: string
}

interface VerificationRequestData {
  businessId: string
  businessName: string
  ownerName: string
  ownerEmail: string
  requestedAt: string
  requestId: string
  ownerNotes?: string
  actorUserId?: string
}

interface ReviewerNotificationData {
  reviewId: string
  reviewerEmail: string
  reviewerName: string
  businessName: string
  rating: number
  reviewExcerpt: string
  businessSlug?: string
  actorUserId?: string
}

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}

class NotificationService {
  private baseUrl: string
  private adminEmails: string[]

  constructor() {
    this.baseUrl = process.env.APP_BASE_URL || "https://persianhub.com.au"
    this.adminEmails = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean)
  }

  // Business notification methods
  async notifyBusinessSubmitted(data: BusinessNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending business submitted notifications")

    const dashboardUrl = `${this.baseUrl}/dashboard`
    const adminBusinessUrl = `${this.baseUrl}/admin/pending-businesses`

    // Send email to business owner
    const ownerTemplate = emailTemplates.businessSubmitted({
      ownerName: data.ownerName,
      businessName: data.businessName,
      dashboardUrl,
    })

    const ownerSuccess = await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: ownerTemplate.subject,
        templateKey: "business_submitted",
        variables: {
          ownerName: data.ownerName,
          businessName: data.businessName,
          dashboardUrl,
        },
        entityType: "business",
        entityId: data.businessId,
        actorUserId: data.actorUserId,
      },
      ownerTemplate.html,
      ownerTemplate.text,
    )

    // Send email to admins
    if (this.adminEmails.length > 0) {
      const adminTemplate = emailTemplates.adminNewBusiness({
        businessName: data.businessName,
        ownerEmail: data.ownerEmail,
        adminBusinessUrl,
      })

      const adminSuccess = await emailService.sendEmail(
        {
          to: this.adminEmails,
          subject: adminTemplate.subject,
          templateKey: "admin_business_submitted",
          variables: {
            businessName: data.businessName,
            ownerEmail: data.ownerEmail,
            adminBusinessUrl,
          },
          entityType: "business",
          entityId: data.businessId,
          actorUserId: data.actorUserId,
        },
        adminTemplate.html,
        adminTemplate.text,
      )

      return ownerSuccess && adminSuccess
    }

    return ownerSuccess
  }

  async notifyBusinessApproved(data: BusinessNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending business approved notification")

    const listingUrl = data.slug ? `${this.baseUrl}/businesses/${data.slug}` : `${this.baseUrl}/businesses`

    const template = emailTemplates.businessApproved({
      ownerName: data.ownerName,
      businessName: data.businessName,
      listingUrl,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "business_approved",
        variables: {
          ownerName: data.ownerName,
          businessName: data.businessName,
          listingUrl,
        },
        entityType: "business",
        entityId: data.businessId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  async notifyBusinessRejected(data: BusinessNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending business rejected notification")

    if (!data.rejectionReason) {
      console.warn("[NotificationService] No rejection reason provided for business rejection")
      return false
    }

    const editUrl = `${this.baseUrl}/dashboard/businesses/${data.businessId}/edit`

    const template = emailTemplates.businessRejected({
      ownerName: data.ownerName,
      businessName: data.businessName,
      rejectionReason: data.rejectionReason,
      editUrl,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "business_rejected",
        variables: {
          ownerName: data.ownerName,
          businessName: data.businessName,
          rejectionReason: data.rejectionReason,
          editUrl,
        },
        entityType: "business",
        entityId: data.businessId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  async notifyBusinessVerified(data: BusinessNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending business verified notification")

    const listingUrl = data.slug ? `${this.baseUrl}/businesses/${data.slug}` : `${this.baseUrl}/businesses`

    const template = emailTemplates.businessVerified({
      ownerName: data.ownerName,
      businessName: data.businessName,
      listingUrl,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "business_verified",
        variables: {
          ownerName: data.ownerName,
          businessName: data.businessName,
          listingUrl,
        },
        entityType: "business",
        entityId: data.businessId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  // Review notification methods
  async notifyReviewSubmitted(data: ReviewNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending review submitted notification to admins")

    if (this.adminEmails.length === 0) {
      console.warn("[NotificationService] No admin emails configured")
      return false
    }

    const adminReviewUrl = `${this.baseUrl}/admin/pending-reviews`

    const template = emailTemplates.adminNewReview({
      businessName: data.businessName,
      reviewExcerpt: data.reviewExcerpt,
      adminReviewUrl,
    })

    return await emailService.sendEmail(
      {
        to: this.adminEmails,
        subject: template.subject,
        templateKey: "admin_review_submitted",
        variables: {
          businessName: data.businessName,
          reviewExcerpt: data.reviewExcerpt,
          adminReviewUrl,
        },
        entityType: "review",
        entityId: data.reviewId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  async notifyReviewApproved(data: ReviewNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending review approved notification to business owner")

    const reviewsUrl = `${this.baseUrl}/businesses/${data.businessId}#reviews`

    const template = emailTemplates.reviewApproved({
      ownerName: data.businessOwnerName,
      businessName: data.businessName,
      reviewExcerpt: data.reviewExcerpt,
      reviewsUrl,
    })

    return await emailService.sendEmail(
      {
        to: [data.businessOwnerEmail],
        subject: template.subject,
        templateKey: "review_approved",
        variables: {
          ownerName: data.businessOwnerName,
          businessName: data.businessName,
          reviewExcerpt: data.reviewExcerpt,
          reviewsUrl,
        },
        entityType: "review",
        entityId: data.reviewId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  // New user registration notification
  async notifyNewUserRegistered(data: UserRegistrationData): Promise<boolean> {
    console.log("[NotificationService] Sending new user registration notification to admins")

    if (this.adminEmails.length === 0) {
      console.warn("[NotificationService] No admin emails configured")
      return false
    }

    const adminUserLink = `${this.baseUrl}/admin/users/${data.userId}`

    const template = emailTemplates.adminNewUserRegistered({
      userName: data.userName,
      userEmail: data.userEmail,
      registeredAt: data.registeredAt,
      adminUserLink,
    })

    return await emailService.sendEmail(
      {
        to: this.adminEmails,
        subject: template.subject,
        templateKey: "admin_new_user_registered",
        variables: {
          userName: data.userName,
          userEmail: data.userEmail,
          registeredAt: data.registeredAt,
          adminUserLink,
        },
        entityType: "user",
        entityId: data.userId,
      },
      template.html,
      template.text,
    )
  }

  // Business verification request notifications
  async notifyVerificationRequest(data: VerificationRequestData): Promise<boolean> {
    console.log("[NotificationService] Sending verification request notifications")

    const adminVerificationLink = `${this.baseUrl}/admin/verification-requests`
    const adminBusinessLink = `${this.baseUrl}/admin/businesses/${data.businessId}`
    const statusLink = `${this.baseUrl}/dashboard/businesses/${data.businessId}`

    // Send confirmation email to business owner
    const ownerTemplate = emailTemplates.userVerificationConfirmation({
      ownerName: data.ownerName,
      businessName: data.businessName,
      requestedAt: data.requestedAt,
      requestId: data.requestId,
      ownerEmail: data.ownerEmail,
      statusLink,
    })

    const ownerSuccess = await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: ownerTemplate.subject,
        templateKey: "user_verification_confirmation",
        variables: {
          ownerName: data.ownerName,
          businessName: data.businessName,
          requestedAt: data.requestedAt,
          requestId: data.requestId,
          ownerEmail: data.ownerEmail,
          statusLink,
        },
        entityType: "verification_request",
        entityId: data.requestId,
        actorUserId: data.actorUserId,
      },
      ownerTemplate.html,
      ownerTemplate.text,
    )

    // Send notification email to admins
    let adminSuccess = true
    if (this.adminEmails.length > 0) {
      const adminTemplate = emailTemplates.adminVerificationRequest({
        businessName: data.businessName,
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        requestedAt: data.requestedAt,
        businessId: data.businessId,
        ownerNotes: data.ownerNotes,
        adminVerificationLink,
        adminBusinessLink,
      })

      adminSuccess = await emailService.sendEmail(
        {
          to: this.adminEmails,
          subject: adminTemplate.subject,
          templateKey: "admin_verification_request",
          variables: {
            businessName: data.businessName,
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
            requestedAt: data.requestedAt,
            businessId: data.businessId,
            ownerNotes: data.ownerNotes,
            adminVerificationLink,
            adminBusinessLink,
          },
          entityType: "verification_request",
          entityId: data.requestId,
          actorUserId: data.actorUserId,
        },
        adminTemplate.html,
        adminTemplate.text,
      )
    }

    return ownerSuccess && adminSuccess
  }

  // Review approved notification to reviewer (not business owner)
  async notifyReviewerApproved(data: ReviewerNotificationData): Promise<boolean> {
    console.log("[NotificationService] Sending review approved notification to reviewer")

    const reviewLink = data.businessSlug
      ? `${this.baseUrl}/businesses/${data.businessSlug}#review-${data.reviewId}`
      : `${this.baseUrl}/businesses#review-${data.reviewId}`
    const businessLink = data.businessSlug
      ? `${this.baseUrl}/businesses/${data.businessSlug}`
      : `${this.baseUrl}/businesses`

    const template = emailTemplates.userReviewApproved({
      reviewerName: data.reviewerName,
      businessName: data.businessName,
      rating: data.rating,
      reviewExcerpt: data.reviewExcerpt,
      reviewLink,
      businessLink,
    })

    return await emailService.sendEmail(
      {
        to: [data.reviewerEmail],
        subject: template.subject,
        templateKey: "user_review_approved",
        variables: {
          reviewerName: data.reviewerName,
          businessName: data.businessName,
          rating: data.rating,
          reviewExcerpt: data.reviewExcerpt,
          reviewLink,
          businessLink,
        },
        entityType: "review",
        entityId: data.reviewId,
        actorUserId: data.actorUserId,
      },
      template.html,
      template.text,
    )
  }

  // Verification request notification methods
  async sendAdminVerificationRequest(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
    requestMessage: string
    requestId: string
  }): Promise<boolean> {
    console.log("[NotificationService] Sending admin verification request notification")

    if (this.adminEmails.length === 0) {
      console.warn("[NotificationService] No admin emails configured")
      return false
    }

    const adminVerificationLink = `${this.baseUrl}/admin/verification-requests`

    const template = emailTemplates.adminVerificationRequest({
      businessName: data.businessName,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      requestMessage: data.requestMessage,
      adminVerificationLink,
    })

    return await emailService.sendEmail(
      {
        to: this.adminEmails,
        subject: template.subject,
        templateKey: "admin_verification_request",
        variables: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          requestMessage: data.requestMessage,
          adminVerificationLink,
        },
        entityType: "verification_request",
        entityId: data.requestId,
      },
      template.html,
      template.text,
    )
  }

  async sendUserVerificationConfirmation(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
  }): Promise<boolean> {
    console.log("[NotificationService] Sending user verification confirmation")

    const statusLink = `${this.baseUrl}/dashboard`

    const template = emailTemplates.userVerificationConfirmation({
      businessName: data.businessName,
      ownerName: data.ownerName,
      statusLink,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "user_verification_confirmation",
        variables: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          statusLink,
        },
        entityType: "verification_request",
        entityId: "confirmation",
      },
      template.html,
      template.text,
    )
  }

  async sendVerificationApproved(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
    adminNotes?: string
  }): Promise<boolean> {
    console.log("[NotificationService] Sending verification approved notification")

    const businessLink = `${this.baseUrl}/dashboard`

    const template = emailTemplates.verificationApproved({
      businessName: data.businessName,
      ownerName: data.ownerName,
      adminNotes: data.adminNotes,
      businessLink,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "verification_approved",
        variables: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          adminNotes: data.adminNotes,
          businessLink,
        },
        entityType: "verification_request",
        entityId: "approved",
      },
      template.html,
      template.text,
    )
  }

  async sendVerificationRejected(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
    adminNotes: string
  }): Promise<boolean> {
    console.log("[NotificationService] Sending verification rejected notification")

    const resubmitLink = `${this.baseUrl}/dashboard`

    const template = emailTemplates.verificationRejected({
      businessName: data.businessName,
      ownerName: data.ownerName,
      rejectionReason: data.adminNotes,
      resubmitLink,
    })

    return await emailService.sendEmail(
      {
        to: [data.ownerEmail],
        subject: template.subject,
        templateKey: "verification_rejected",
        variables: {
          businessName: data.businessName,
          ownerName: data.ownerName,
          rejectionReason: data.adminNotes,
          resubmitLink,
        },
        entityType: "verification_request",
        entityId: "rejected",
      },
      template.html,
      template.text,
    )
  }

  // Contact form message method
  async sendContactFormMessage(data: ContactFormData): Promise<boolean> {
    console.log("[NotificationService] Sending contact form message to admins")

    if (this.adminEmails.length === 0) {
      console.warn("[NotificationService] No admin emails configured")
      return false
    }

    const currentDate = new Date().toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Australia/Brisbane",
    })

    const template = emailTemplates.contactFormMessage({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      subject: data.subject,
      message: data.message,
      date: currentDate,
    })

    return await emailService.sendEmail(
      {
        to: this.adminEmails,
        subject: template.subject,
        templateKey: "contact_form_message",
        variables: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          subject: data.subject,
          message: data.message,
          date: currentDate,
        },
        entityType: "contact_form",
        entityId: crypto.randomUUID(),
      },
      template.html,
      template.text,
    )
  }

  // Helper method to get business and owner data from database
  async getBusinessNotificationData(businessId: string): Promise<BusinessNotificationData | null> {
    const supabase = createClient()

    const { data: business, error } = await supabase
      .from("businesses")
      .select(`
        id,
        name,
        slug,
        owner_id,
        profiles!businesses_owner_id_fkey (
          email,
          full_name
        )
      `)
      .eq("id", businessId)
      .single()

    if (error || !business) {
      console.error("[NotificationService] Failed to fetch business data:", error)
      return null
    }

    return {
      businessId: business.id,
      businessName: business.name,
      ownerEmail: business.profiles.email,
      ownerName: business.profiles.full_name || "Business Owner",
      slug: business.slug,
    }
  }

  // Helper method to get review and related business data
  async getReviewNotificationData(reviewId: string): Promise<ReviewNotificationData | null> {
    const supabase = createClient()

    const { data: review, error } = await supabase
      .from("reviews")
      .select(`
        id,
        comment,
        businesses!reviews_business_id_fkey (
          id,
          name,
          slug,
          owner_id,
          profiles!businesses_owner_id_fkey (
            email,
            full_name
          )
        )
      `)
      .eq("id", reviewId)
      .single()

    if (error || !review) {
      console.error("[NotificationService] Failed to fetch review data:", error)
      return null
    }

    const reviewExcerpt = review.comment.length > 100 ? review.comment.substring(0, 100) + "..." : review.comment

    return {
      reviewId: review.id,
      businessId: review.businesses.id,
      businessName: review.businesses.name,
      businessOwnerEmail: review.businesses.profiles.email,
      businessOwnerName: review.businesses.profiles.full_name || "Business Owner",
      reviewExcerpt,
    }
  }
}

export const notificationService = new NotificationService()
export { NotificationService }
export default notificationService
