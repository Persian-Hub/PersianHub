// Email template rendering service for Persian Hub notifications
// Uses the HTML templates from the specification with Persian Hub branding

interface TemplateVariables {
  [key: string]: any
}

class EmailTemplates {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.APP_BASE_URL || "https://persianhub.com.au"
  }

  private replaceVariables(template: string, variables: TemplateVariables): string {
    let result = template

    // Replace all {{ variable }} placeholders with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g")
      result = result.replace(placeholder, String(value || ""))
    })

    return result
  }

  // 1. User - Business submitted (pending)
  businessSubmitted(variables: {
    ownerName: string
    businessName: string
    dashboardUrl?: string
  }): { html: string; text: string; subject: string } {
    const dashboardUrl = variables.dashboardUrl || `${this.baseUrl}/dashboard`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>We received your business</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr>
          <td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
            <h2 style="margin-top:0; color:#111827;">We received your business</h2>
            <p>Hi <strong>{{ ownerName }}</strong>,</p>
            <p>Thanks for submitting <strong>{{ businessName }}</strong>. Your listing is now <strong>pending review</strong> by our team. We'll email you once it's approved.</p>
            <p style="text-align:center; margin:30px 0;">
              <a href="{{ dashboardUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View your dashboard</a>
            </p>
            <p>If you didn't create this request, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · All rights reserved</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - We received your business

Hi ${variables.ownerName},

Thanks for submitting ${variables.businessName}. Your listing is now pending review by our team. We'll email you once it's approved.

View your dashboard: ${dashboardUrl}

If you didn't create this request, please ignore this email.

© ${siteUrl} · All rights reserved`

    return {
      html: this.replaceVariables(html, { ...variables, dashboardUrl, siteUrl }),
      text,
      subject: `We received your business: ${variables.businessName}`,
    }
  }

  // 2. User - Business approved
  businessApproved(variables: {
    ownerName: string
    businessName: string
    listingUrl?: string
  }): { html: string; text: string; subject: string } {
    const listingUrl = variables.listingUrl || `${this.baseUrl}/businesses`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Your business is approved</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">Your business is approved 🎉</h2>
          <p>Hi <strong>{{ ownerName }}</strong>,</p>
          <p>Great news — <strong>{{ businessName }}</strong> has been approved and is now visible to users.</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ listingUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View your listing</a>
          </p>
          <p>You can update your information anytime from your dashboard.</p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · All rights reserved</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - Your business is approved

Hi ${variables.ownerName},

Great news — ${variables.businessName} has been approved and is now visible to users.

View your listing: ${listingUrl}

You can update your information anytime from your dashboard.

© ${siteUrl} · All rights reserved`

    return {
      html: this.replaceVariables(html, { ...variables, listingUrl, siteUrl }),
      text,
      subject: `Your business is approved: ${variables.businessName}`,
    }
  }

  // 3. User - Business rejected
  businessRejected(variables: {
    ownerName: string
    businessName: string
    rejectionReason: string
    editUrl?: string
  }): { html: string; text: string; subject: string } {
    const editUrl = variables.editUrl || `${this.baseUrl}/dashboard`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Update on your business</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">We couldn't approve your business</h2>
          <p>Hi <strong>{{ ownerName }}</strong>,</p>
          <p>Thanks for submitting <strong>{{ businessName }}</strong>. After review, we couldn't approve it at this time.</p>
          <p><strong>Reason from our team:</strong></p>
          <blockquote style="margin:16px 0; padding:12px 16px; background:#f3f4f6; border-left:4px solid #e5e7eb;">{{ rejectionReason }}</blockquote>
          <p>You can update your details and resubmit for approval.</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ editUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Edit & resubmit</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · All rights reserved</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - Update on your business

Hi ${variables.ownerName},

Thanks for submitting ${variables.businessName}. After review, we couldn't approve it at this time.

Reason from our team:
${variables.rejectionReason}

You can update your details and resubmit for approval.

Edit & resubmit: ${editUrl}

© ${siteUrl} · All rights reserved`

    return {
      html: this.replaceVariables(html, { ...variables, editUrl, siteUrl }),
      text,
      subject: `Update on your business: ${variables.businessName}`,
    }
  }

  // 4. User - Business verified
  businessVerified(variables: {
    ownerName: string
    businessName: string
    listingUrl?: string
  }): { html: string; text: string; subject: string } {
    const listingUrl = variables.listingUrl || `${this.baseUrl}/businesses`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>Your business is verified</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">Your business is now verified</h2>
          <p>Hi <strong>{{ ownerName }}</strong>,</p>
          <p><strong>{{ businessName }}</strong> is now verified. A verification badge is displayed on your listing to build trust with users.</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ listingUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View your listing</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · All rights reserved</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - Your business is now verified

Hi ${variables.ownerName},

${variables.businessName} is now verified. A verification badge is displayed on your listing to build trust with users.

View your listing: ${listingUrl}

© ${siteUrl} · All rights reserved`

    return {
      html: this.replaceVariables(html, { ...variables, listingUrl, siteUrl }),
      text,
      subject: `Your business is now verified: ${variables.businessName}`,
    }
  }

  // 5. User - Review approved (to business owner)
  reviewApproved(variables: {
    ownerName: string
    businessName: string
    reviewExcerpt: string
    reviewsUrl?: string
  }): { html: string; text: string; subject: string } {
    const reviewsUrl = variables.reviewsUrl || `${this.baseUrl}/businesses`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>New review is live</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">A new review is live</h2>
          <p>Hi <strong>{{ ownerName }}</strong>,</p>
          <p>A new review for <strong>{{ businessName }}</strong> was approved and is now visible.</p>
          <p style="margin:16px 0; padding:12px 16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;"><em>"{{ reviewExcerpt }}"</em></p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ reviewsUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View reviews</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · All rights reserved</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - A new review is live

Hi ${variables.ownerName},

A new review for ${variables.businessName} was approved and is now visible.

"${variables.reviewExcerpt}"

View reviews: ${reviewsUrl}

© ${siteUrl} · All rights reserved`

    return {
      html: this.replaceVariables(html, { ...variables, reviewsUrl, siteUrl }),
      text,
      subject: `A new review is live on ${variables.businessName}`,
    }
  }

  // 6. Admin - New review submitted
  adminNewReview(variables: {
    businessName: string
    reviewExcerpt: string
    adminReviewUrl?: string
  }): { html: string; text: string; subject: string } {
    const adminReviewUrl = variables.adminReviewUrl || `${this.baseUrl}/admin/pending-reviews`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>New review awaiting approval</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub — Admin</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">New review awaiting approval</h2>
          <p><strong>Business:</strong> {{ businessName }}</p>
          <p style="margin:12px 0;"><strong>Excerpt:</strong> <em>"{{ reviewExcerpt }}"</em></p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ adminReviewUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Open review queue</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · Internal notification</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub Admin - New review awaiting approval

Business: ${variables.businessName}
Excerpt: "${variables.reviewExcerpt}"

Open review queue: ${adminReviewUrl}

© ${siteUrl} · Internal notification`

    return {
      html: this.replaceVariables(html, { ...variables, adminReviewUrl, siteUrl }),
      text,
      subject: `New review awaiting approval: ${variables.businessName}`,
    }
  }

  // 7. Admin - New business submitted
  adminNewBusiness(variables: {
    businessName: string
    ownerEmail: string
    adminBusinessUrl?: string
  }): { html: string; text: string; subject: string } {
    const adminBusinessUrl = variables.adminBusinessUrl || `${this.baseUrl}/admin/pending-businesses`
    const siteUrl = this.baseUrl

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><title>New business awaiting approval</title></head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; margin:0; padding:0;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding:24px; background-color:#4F46E5; background-color: oklch(54.6% .245 262.881);">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">Persian Hub — Admin</h1></td></tr>
        <tr><td style="padding:32px; color:#1f2937; font-size:16px; line-height:1.6;">
          <h2 style="margin-top:0; color:#111827;">New business awaiting approval</h2>
          <p><strong>Business:</strong> {{ businessName }}</p>
          <p><strong>Owner email:</strong> {{ ownerEmail }}</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{{ adminBusinessUrl }}" style="background-color:#4F46E5; background-color: oklch(54.6% .245 262.881); color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">Open business queue</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background-color:#f3f4f6; padding:20px; font-size:12px; color:#6b7280;">© {{ siteUrl }} · Internal notification</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const text = `Persian Hub Admin - New business awaiting approval

Business: ${variables.businessName}
Owner email: ${variables.ownerEmail}

Open business queue: ${adminBusinessUrl}

© ${siteUrl} · Internal notification`

    return {
      html: this.replaceVariables(html, { ...variables, adminBusinessUrl, siteUrl }),
      text,
      subject: `New business awaiting approval: ${variables.businessName}`,
    }
  }

  // 8. Admin - New user registered
  adminNewUserRegistered(variables: {
    userName: string
    userEmail: string
    registeredAt: string
    adminUserLink?: string
  }): { html: string; text: string; subject: string } {
    const adminUserLink = variables.adminUserLink || `${this.baseUrl}/admin/users`
    const siteUrl = this.baseUrl

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New user registered</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(90deg,#0f766e,#0ea5a4);padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">Persian Hub</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <h1 style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#111827;">New user registered</h1>
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">
                A new user just signed up on <strong>Persian Hub</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Name:</strong> {{ userName }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Email:</strong> {{ userEmail }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Registered at:</strong> {{ registeredAt }}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px 24px;">
              <a href="{{ adminUserLink }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Open in Admin</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
                You're receiving this email because you're an administrator of Persian Hub.
              </div>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Persian Hub Admin - New user registered

Name: ${variables.userName}
Email: ${variables.userEmail}
Registered at: ${variables.registeredAt}

Open in Admin: ${adminUserLink}

You're receiving this email because you're an administrator of Persian Hub.`

    return {
      html: this.replaceVariables(html, { ...variables, adminUserLink, siteUrl }),
      text,
      subject: "New user registered on Persian Hub",
    }
  }

  // 9. Admin - Owner requested business verification
  adminVerificationRequest(variables: {
    businessName: string
    ownerName: string
    ownerEmail: string
    requestedAt: string
    businessId: string
    ownerNotes?: string
    adminVerificationLink?: string
    adminBusinessLink?: string
  }): { html: string; text: string; subject: string } {
    const adminVerificationLink = variables.adminVerificationLink || `${this.baseUrl}/admin/verification-requests`
    const adminBusinessLink = variables.adminBusinessLink || `${this.baseUrl}/admin/businesses/${variables.businessId}`
    const siteUrl = this.baseUrl

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verification request</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(90deg,#0f766e,#0ea5a4);padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">Persian Hub</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <h1 style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#111827;">New verification request</h1>
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">
                The owner of <strong>{{ businessName }}</strong> has requested verification.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Owner:</strong> {{ ownerName }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Email:</strong> {{ ownerEmail }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Requested at:</strong> {{ requestedAt }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Business ID:</strong> {{ businessId }}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;"><strong>Notes:</strong></div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">{{ ownerNotes }}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px 24px;">
              <a href="{{ adminVerificationLink }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Review & Verify</a>
              <a href="{{ adminBusinessLink }}" style="display:inline-block;margin-left:8px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Open Business</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">Admin notification • Persian Hub</div>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Persian Hub Admin - Verification request received for ${variables.businessName}

Owner: ${variables.ownerName}
Email: ${variables.ownerEmail}
Requested at: ${variables.requestedAt}
Business ID: ${variables.businessId}

Notes: ${variables.ownerNotes || "No notes provided"}

Review & Verify: ${adminVerificationLink}
Open Business: ${adminBusinessLink}

Admin notification • Persian Hub`

    return {
      html: this.replaceVariables(html, { ...variables, adminVerificationLink, adminBusinessLink, siteUrl }),
      text,
      subject: `Verification request received for ${variables.businessName}`,
    }
  }

  // 10. User - Verification request received (confirmation)
  userVerificationConfirmation(variables: {
    ownerName: string
    businessName: string
    requestedAt: string
    requestId: string
    ownerEmail: string
    statusLink?: string
  }): { html: string; text: string; subject: string } {
    const statusLink = variables.statusLink || `${this.baseUrl}/dashboard`
    const siteUrl = this.baseUrl

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verification request received</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(90deg,#0f766e,#0ea5a4);padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">Persian Hub</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <h1 style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#111827;">Thanks, we got your request</h1>
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">
                Hi {{ ownerName }}, we've received your verification request for <strong>{{ businessName }}</strong>. Our team will review it and get back to you as soon as possible.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Submitted:</strong> {{ requestedAt }}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Reference:</strong> {{ requestId }}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px 24px;">
              <a href="{{ statusLink }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">View request status</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;">
                If we need more information, we'll contact you at <strong>{{ ownerEmail }}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">Thank you for helping keep Persian Hub trusted and up to date.</div>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - We received your verification request

Hi ${variables.ownerName},

We've received your verification request for ${variables.businessName}. Our team will review it and get back to you as soon as possible.

Submitted: ${variables.requestedAt}
Reference: ${variables.requestId}

View request status: ${statusLink}

If we need more information, we'll contact you at ${variables.ownerEmail}.

Thank you for helping keep Persian Hub trusted and up to date.`

    return {
      html: this.replaceVariables(html, { ...variables, statusLink, siteUrl }),
      text,
      subject: "We received your verification request",
    }
  }

  // 11. User (reviewer, not the owner) - Review approved
  userReviewApproved(variables: {
    reviewerName: string
    businessName: string
    rating: number
    reviewExcerpt: string
    reviewLink?: string
    businessLink?: string
  }): { html: string; text: string; subject: string } {
    const reviewLink = variables.reviewLink || `${this.baseUrl}/businesses`
    const businessLink = variables.businessLink || `${this.baseUrl}/businesses`
    const siteUrl = this.baseUrl

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Review approved</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(90deg,#0f766e,#0ea5a4);padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">Persian Hub</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <h1 style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#111827;">Your review is live 🎉</h1>
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">
                Hi {{ reviewerName }}, thanks for sharing your experience! Your review of <strong>{{ businessName }}</strong> has been approved and published.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Rating:</strong> {{ rating }}/5</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;"><strong>Review excerpt:</strong></div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">"{{ reviewExcerpt }}"</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px 24px;">
              <a href="{{ reviewLink }}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">View your review</a>
              <a href="{{ businessLink }}" style="display:inline-block;margin-left:8px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;">See business page</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
                You're receiving this because you submitted a review on Persian Hub.
              </div>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Persian Hub - Your review was approved and is now live

Hi ${variables.reviewerName},

Thanks for sharing your experience! Your review of ${variables.businessName} has been approved and published.

Rating: ${variables.rating}/5
Review excerpt: "${variables.reviewExcerpt}"

View your review: ${reviewLink}
See business page: ${businessLink}

You're receiving this because you submitted a review on Persian Hub.`

    return {
      html: this.replaceVariables(html, { ...variables, reviewLink, businessLink, siteUrl }),
      text,
      subject: "Your review was approved and is now live",
    }
  }
}

export const emailTemplates = new EmailTemplates()
export default emailTemplates
