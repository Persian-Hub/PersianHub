import fs from "fs"
import path from "path"

export class EmailTemplates {
  private templateCache: Map<string, string> = new Map()

  loadTemplate(templateName: string): string {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!
    }

    try {
      const templatePath = path.join(process.cwd(), "lib", "email-templates", templateName)
      const template = fs.readFileSync(templatePath, "utf-8")
      this.templateCache.set(templateName, template)
      return template
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error)
      return ""
    }
  }

  businessSubmitted(data: { ownerName: string; businessName: string; dashboardUrl: string }) {
    const html = this.loadTemplate("business-submitted.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{dashboardUrl\}\}/g, data.dashboardUrl)

    const text = `
Hello ${data.ownerName},

Thank you for submitting your business "${data.businessName}" to Persian Hub!

Your business listing is now under review by our team. We'll notify you once it's approved and live on the platform.

You can check the status of your submission in your dashboard: ${data.dashboardUrl}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Business Submission Received - ${data.businessName}`,
      html,
      text,
    }
  }

  adminNewBusiness(data: { businessName: string; ownerEmail: string; adminBusinessUrl: string }) {
    const html = this.loadTemplate("admin-new-business.html")
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{ownerEmail\}\}/g, data.ownerEmail)
      .replace(/\{\{adminBusinessUrl\}\}/g, data.adminBusinessUrl)

    const text = `
New Business Submission - Persian Hub Admin

A new business has been submitted for review:

Business Name: ${data.businessName}
Owner Email: ${data.ownerEmail}

Please review and approve/reject this submission: ${data.adminBusinessUrl}

Persian Hub Admin Team
    `.trim()

    return {
      subject: `New Business Submission: ${data.businessName}`,
      html,
      text,
    }
  }

  businessApproved(data: { ownerName: string; businessName: string; listingUrl: string }) {
    const html = this.loadTemplate("business-approved.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{listingUrl\}\}/g, data.listingUrl)

    const text = `
Congratulations ${data.ownerName}!

Your business "${data.businessName}" has been approved and is now live on Persian Hub!

You can view your listing here: ${data.listingUrl}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Business Approved - ${data.businessName}`,
      html,
      text,
    }
  }

  businessRejected(data: { ownerName: string; businessName: string; rejectionReason: string; editUrl: string }) {
    const html = this.loadTemplate("business-rejected.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{rejectionReason\}\}/g, data.rejectionReason)
      .replace(/\{\{editUrl\}\}/g, data.editUrl)

    const text = `
Hello ${data.ownerName},

Unfortunately, your business submission "${data.businessName}" has been rejected for the following reason:

${data.rejectionReason}

You can edit and resubmit your business listing here: ${data.editUrl}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Business Submission Update - ${data.businessName}`,
      html,
      text,
    }
  }

  businessVerified(data: { ownerName: string; businessName: string; listingUrl: string }) {
    const html = this.loadTemplate("business-verified.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{listingUrl\}\}/g, data.listingUrl)

    const text = `
Congratulations ${data.ownerName}!

Your business "${data.businessName}" has been verified on Persian Hub!

Your verified listing: ${data.listingUrl}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Business Verified - ${data.businessName}`,
      html,
      text,
    }
  }

  adminNewReview(data: { businessName: string; reviewExcerpt: string; adminReviewUrl: string }) {
    const html = this.loadTemplate("admin-new-review.html")
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{reviewExcerpt\}\}/g, data.reviewExcerpt)
      .replace(/\{\{adminReviewUrl\}\}/g, data.adminReviewUrl)

    const text = `
New Review Submission - Persian Hub Admin

A new review has been submitted for: ${data.businessName}

Review excerpt: ${data.reviewExcerpt}

Please review and moderate: ${data.adminReviewUrl}

Persian Hub Admin Team
    `.trim()

    return {
      subject: `New Review for ${data.businessName}`,
      html,
      text,
    }
  }

  reviewApproved(data: { ownerName: string; businessName: string; reviewExcerpt: string; reviewsUrl: string }) {
    const html = this.loadTemplate("review-approved.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{reviewExcerpt\}\}/g, data.reviewExcerpt)
      .replace(/\{\{reviewsUrl\}\}/g, data.reviewsUrl)

    const text = `
Hello ${data.ownerName},

A new review has been approved for your business "${data.businessName}":

"${data.reviewExcerpt}"

View all reviews: ${data.reviewsUrl}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `New Review Approved - ${data.businessName}`,
      html,
      text,
    }
  }

  adminNewUserRegistered(data: { userName: string; userEmail: string; registeredAt: string; adminUserLink: string }) {
    const html = this.loadTemplate("admin-new-user-registered.html")
      .replace(/\{\{userName\}\}/g, data.userName)
      .replace(/\{\{userEmail\}\}/g, data.userEmail)
      .replace(/\{\{registeredAt\}\}/g, data.registeredAt)
      .replace(/\{\{adminUserLink\}\}/g, data.adminUserLink)

    const text = `
New User Registration - Persian Hub Admin

A new user has registered:

Name: ${data.userName}
Email: ${data.userEmail}
Registered: ${data.registeredAt}

View user details: ${data.adminUserLink}

Persian Hub Admin Team
    `.trim()

    return {
      subject: `New User Registration: ${data.userName}`,
      html,
      text,
    }
  }

  adminVerificationRequest(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
    requestedAt?: string
    businessId?: string
    ownerNotes?: string
    adminVerificationLink: string
    adminBusinessLink?: string
    requestMessage?: string
  }) {
    const html = this.loadTemplate("admin-verification-request.html")
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{ownerEmail\}\}/g, data.ownerEmail)
      .replace(/\{\{requestedAt\}\}/g, data.requestedAt || new Date().toLocaleDateString())
      .replace(/\{\{businessId\}\}/g, data.businessId || "")
      .replace(/\{\{ownerNotes\}\}/g, data.ownerNotes || data.requestMessage || "No additional notes provided")
      .replace(/\{\{adminVerificationLink\}\}/g, data.adminVerificationLink)
      .replace(/\{\{adminBusinessLink\}\}/g, data.adminBusinessLink || "")

    const text = `
Business Verification Request - Persian Hub Admin

A business owner has requested verification:

Business: ${data.businessName}
Owner: ${data.ownerName} (${data.ownerEmail})
Requested: ${data.requestedAt || new Date().toLocaleDateString()}

Owner Notes: ${data.ownerNotes || data.requestMessage || "No additional notes provided"}

Review verification requests: ${data.adminVerificationLink}

Persian Hub Admin Team
    `.trim()

    return {
      subject: `Verification Request: ${data.businessName}`,
      html,
      text,
    }
  }

  userVerificationConfirmation(data: {
    ownerName: string
    businessName: string
    requestedAt?: string
    requestId?: string
    ownerEmail?: string
    statusLink: string
  }) {
    const html = this.loadTemplate("user-verification-confirmation.html")
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{requestedAt\}\}/g, data.requestedAt || new Date().toLocaleDateString())
      .replace(/\{\{requestId\}\}/g, data.requestId || "")
      .replace(/\{\{ownerEmail\}\}/g, data.ownerEmail || "")
      .replace(/\{\{statusLink\}\}/g, data.statusLink)

    const text = `
Hello ${data.ownerName},

Thank you for requesting verification for your business "${data.businessName}".

Your verification request has been received and is being reviewed by our team. We'll notify you once a decision has been made.

You can check the status in your dashboard: ${data.statusLink}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Verification Request Received - ${data.businessName}`,
      html,
      text,
    }
  }

  userReviewApproved(data: {
    reviewerName: string
    businessName: string
    rating: number
    reviewExcerpt: string
    reviewLink: string
    businessLink: string
  }) {
    const html = this.loadTemplate("user-review-approved.html")
      .replace(/\{\{reviewerName\}\}/g, data.reviewerName)
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{rating\}\}/g, data.rating.toString())
      .replace(/\{\{reviewExcerpt\}\}/g, data.reviewExcerpt)
      .replace(/\{\{reviewLink\}\}/g, data.reviewLink)
      .replace(/\{\{businessLink\}\}/g, data.businessLink)

    const text = `
Hello ${data.reviewerName},

Your review for "${data.businessName}" has been approved and is now live!

Your review: "${data.reviewExcerpt}"
Rating: ${data.rating}/5 stars

View your review: ${data.reviewLink}

Thank you for contributing to the Persian Hub community!

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Your Review Has Been Approved - ${data.businessName}`,
      html,
      text,
    }
  }

  verificationApproved(data: { businessName: string; ownerName: string; adminNotes?: string; businessLink: string }) {
    const html = this.loadTemplate("verification-approved.html")
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{adminNotes\}\}/g, data.adminNotes || "Your business meets our verification standards.")
      .replace(/\{\{businessLink\}\}/g, data.businessLink)

    const text = `
Congratulations ${data.ownerName}!

Your verification request for "${data.businessName}" has been approved!

${data.adminNotes || "Your business meets our verification standards."}

Your business is now verified on Persian Hub: ${data.businessLink}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Verification Approved - ${data.businessName}`,
      html,
      text,
    }
  }

  verificationRejected(data: {
    businessName: string
    ownerName: string
    rejectionReason: string
    resubmitLink: string
  }) {
    const html = this.loadTemplate("verification-rejected.html")
      .replace(/\{\{businessName\}\}/g, data.businessName)
      .replace(/\{\{ownerName\}\}/g, data.ownerName)
      .replace(/\{\{rejectionReason\}\}/g, data.rejectionReason)
      .replace(/\{\{resubmitLink\}\}/g, data.resubmitLink)

    const text = `
Hello ${data.ownerName},

Unfortunately, your verification request for "${data.businessName}" has been declined.

Reason: ${data.rejectionReason}

You can address these concerns and submit a new verification request: ${data.resubmitLink}

Best regards,
The Persian Hub Team
    `.trim()

    return {
      subject: `Verification Request Update - ${data.businessName}`,
      html,
      text,
    }
  }

  contactFormMessage(data: {
    firstName: string
    lastName: string
    email: string
    subject: string
    message: string
    date: string
  }) {
    const html = this.loadTemplate("contact-form-message.html")
      .replace(/\{\{firstName\}\}/g, data.firstName)
      .replace(/\{\{lastName\}\}/g, data.lastName)
      .replace(/\{\{email\}\}/g, data.email)
      .replace(/\{\{subject\}\}/g, data.subject)
      .replace(/\{\{message\}\}/g, data.message)
      .replace(/\{\{date\}\}/g, data.date)

    const text = `
New Contact Form Message - Persian Hub

From: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}
Date: ${data.date}

Message:
${data.message}

Please respond to this inquiry at your earliest convenience.

This message was sent through the Persian Hub contact form.
Persian Hub - Connecting Persian Businesses in Australia
    `.trim()

    return {
      subject: `Contact Form: ${data.subject}`,
      html,
      text,
    }
  }
}

export const emailTemplates = new EmailTemplates()
export default emailTemplates
