export class EmailTemplates {
  adminBusinessReport(data: {
    businessName: string
    reportCategory: string
    description: string
    reporterName: string
    reporterEmail: string
    adminReportsLink: string
    businessLink: string
  }) {
    const categoryLabels: Record<string, string> = {
      bullying_unwanted_contact: "Bullying or unwanted contact",
      restricted_items: "Selling or promoting restricted items",
      nudity_sexual_activity: "Nudity or sexual activity",
      scam_fraud_spam: "Scam, fraud or spam",
      false_information: "False information",
      intellectual_property: "Intellectual Property",
      child_sexual_abuse: "Child Sexual Abuse and Exploitation",
    }

    const categoryLabel = categoryLabels[data.reportCategory] || data.reportCategory

    const subject = `🚨 Business Report: ${data.businessName}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Report - Persian Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .alert-box { background: #fee; border: 1px solid #fcc; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .report-details { background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button.secondary { background: #6c757d; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Business Report Received</h1>
            <p>A user has reported a business for policy violations</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Urgent: Business Report</h2>
              <p>A business has been reported for potential policy violations and requires immediate admin review.</p>
            </div>

            <div class="report-details">
              <h3>Report Details</h3>
              <p><strong>Business:</strong> ${data.businessName}</p>
              <p><strong>Report Category:</strong> ${categoryLabel}</p>
              <p><strong>Reporter:</strong> ${data.reporterName} (${data.reporterEmail})</p>
              
              <h4>Description:</h4>
              <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">${data.description}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminReportsLink}" class="button">Review Report</a>
              <a href="${data.businessLink}" class="button secondary">View Business</a>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the report details and evidence</li>
              <li>Investigate the reported business</li>
              <li>Take appropriate action (approve, dismiss, or escalate)</li>
              <li>Respond to the reporter with your decision</li>
            </ul>
          </div>

          <div class="footer">
            <p>Persian Hub Admin Panel</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
Business Report Received - Persian Hub

A user has reported a business for policy violations:

Business: ${data.businessName}
Report Category: ${categoryLabel}
Reporter: ${data.reporterName} (${data.reporterEmail})

Description:
${data.description}

Please review this report immediately:
${data.adminReportsLink}

View Business: ${data.businessLink}

Next Steps:
- Review the report details and evidence
- Investigate the reported business
- Take appropriate action (approve, dismiss, or escalate)
- Respond to the reporter with your decision

Persian Hub Admin Panel
    `

    return { subject, html, text }
  }
}

export const emailTemplates = new EmailTemplates()
