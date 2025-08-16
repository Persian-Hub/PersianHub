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
}

export const emailTemplates = new EmailTemplates()
export default emailTemplates
