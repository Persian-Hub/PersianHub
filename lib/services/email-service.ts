import nodemailer from "nodemailer"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  fromName: string
  fromEmail: string
  adminEmails: string[]
  baseUrl: string
}

// Email template data interface
interface EmailData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  templateKey: string
  templateVersion?: string
  variables: Record<string, any>
  entityType?: string
  entityId?: string
  actorUserId?: string
}

// Email log entry interface
interface EmailLogEntry {
  status: "queued" | "sending" | "sent" | "failed" | "cancelled"
  attempts: number
  attempted_at: string[]
  sent_at?: string
  provider: string
  provider_message_id?: string
  from_email: string
  from_name?: string
  reply_to?: string
  to_emails: string[]
  cc_emails: string[]
  bcc_emails: string[]
  subject: string
  template_key: string
  template_version: string
  variables: Record<string, any>
  body_text?: string
  body_html?: string
  error_code?: string
  error_message?: string
  dedup_key: string
  correlation_id: string
  entity_type?: string
  entity_id?: string
  actor_user_id?: string
}

const isV0Environment = () => {
  return (
    process.env.NODE_ENV === "development" ||
    typeof window !== "undefined" ||
    !process.env.SMTP_HOST ||
    process.env.VERCEL_ENV === "preview"
  )
}

class EmailService {
  private config: EmailConfig
  private transporter: nodemailer.Transporter | null = null
  private emailDisabled = false

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      fromName: process.env.EMAIL_FROM_NAME || "Persian Hub",
      fromEmail: process.env.EMAIL_FROM_EMAIL || "noreply@persianhub.com.au",
      adminEmails: (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean),
      baseUrl: process.env.APP_BASE_URL || "https://persianhub.com.au",
    }

    if (isV0Environment()) {
      console.log("[EmailService] Email disabled in v0/preview environment")
      this.emailDisabled = true
      return
    }

    this.initializeTransporter()
  }

  private initializeTransporter() {
    if (!this.config.user || !this.config.pass) {
      console.warn("[EmailService] SMTP credentials not configured. Email sending will be disabled.")
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: false, // Use STARTTLS
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
        tls: {
          ciphers: "SSLv3",
        },
      })

      console.log("[EmailService] SMTP transporter initialized successfully")
    } catch (error) {
      console.error("[EmailService] Failed to initialize SMTP transporter:", error)
      this.transporter = null
    }
  }

  private generateDedupKey(
    templateKey: string,
    primaryRecipient: string,
    entityId?: string,
    targetState?: string,
  ): string {
    const parts = [templateKey, primaryRecipient, entityId, targetState].filter(Boolean)
    return Buffer.from(parts.join("|")).toString("base64")
  }

  private async logEmail(emailData: EmailData, logEntry: Partial<EmailLogEntry>): Promise<string> {
    const supabase = createClient()

    const correlationId = crypto.randomUUID()
    const dedupKey = this.generateDedupKey(emailData.templateKey, emailData.to[0], emailData.entityId)

    const fullLogEntry: EmailLogEntry = {
      status: "queued",
      attempts: 0,
      attempted_at: [],
      provider: "smtp",
      from_email: this.config.fromEmail,
      from_name: this.config.fromName,
      to_emails: emailData.to,
      cc_emails: emailData.cc || [],
      bcc_emails: emailData.bcc || [],
      subject: emailData.subject,
      template_key: emailData.templateKey,
      template_version: emailData.templateVersion || "v1",
      variables: emailData.variables,
      dedup_key: dedupKey,
      correlation_id: correlationId,
      entity_type: emailData.entityType,
      entity_id: emailData.entityId,
      actor_user_id: emailData.actorUserId,
      ...logEntry,
    }

    const { error } = await supabase.from("email_log").insert(fullLogEntry)

    if (error) {
      console.error("[EmailService] Failed to log email:", error)
    }

    return correlationId
  }

  private async updateEmailLog(correlationId: string, updates: Partial<EmailLogEntry>) {
    const supabase = createClient()

    const { error } = await supabase.from("email_log").update(updates).eq("correlation_id", correlationId)

    if (error) {
      console.error("[EmailService] Failed to update email log:", error)
    }
  }

  async sendEmail(emailData: EmailData, htmlBody: string, textBody?: string): Promise<boolean> {
    if (this.emailDisabled) {
      console.log("[EmailService] Email disabled in v0 environment. Skipping email send.")
      return true // Return true to not break the flow
    }

    if (!this.transporter) {
      console.warn("[EmailService] SMTP not configured. Email not sent.")
      await this.logEmail(emailData, {
        status: "failed",
        error_code: "SMTP_NOT_CONFIGURED",
        error_message: "SMTP transporter not initialized",
      })
      return false
    }

    // Check for existing email with same dedup key
    const supabase = createClient()
    const dedupKey = this.generateDedupKey(emailData.templateKey, emailData.to[0], emailData.entityId)

    const { data: existing } = await supabase.from("email_log").select("id").eq("dedup_key", dedupKey).single()

    if (existing) {
      console.log("[EmailService] Duplicate email prevented by dedup key:", dedupKey)
      return true
    }

    const correlationId = await this.logEmail(emailData, { status: "queued" })

    try {
      await this.updateEmailLog(correlationId, {
        status: "sending",
        attempts: 1,
        attempted_at: [new Date().toISOString()],
      })

      const fromAddress = `${this.config.fromName} <${this.config.fromEmail}>`
      const replyTo = undefined

      const mailOptions = {
        from: fromAddress,
        replyTo,
        to: emailData.to.join(", "),
        cc: emailData.cc?.join(", "),
        bcc: emailData.bcc?.join(", "),
        subject: emailData.subject,
        html: htmlBody,
        text: textBody,
      }

      try {
        const info = await this.transporter.sendMail(mailOptions)

        await this.updateEmailLog(correlationId, {
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: info.messageId,
          body_html: htmlBody,
          body_text: textBody,
        })

        console.log("[EmailService] Email sent successfully:", info.messageId)
        return true
      } catch (sendError: any) {
        if (sendError.message?.includes("5.7.1") || sendError.message?.includes("not authorized")) {
          console.warn("[EmailService] From address rejected, trying fallback with auth user email")

          mailOptions.from = `${this.config.fromName} <${this.config.user}>`
          mailOptions.replyTo = this.config.fromEmail

          const fallbackInfo = await this.transporter.sendMail(mailOptions)

          await this.updateEmailLog(correlationId, {
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: fallbackInfo.messageId,
            from_email: this.config.user,
            reply_to: this.config.fromEmail,
            body_html: htmlBody,
            body_text: textBody,
            error_message: "Used fallback From address due to O365 Send-As permission",
          })

          console.log("[EmailService] Email sent with fallback From address:", fallbackInfo.messageId)
          return true
        }

        throw sendError
      }
    } catch (error: any) {
      console.error("[EmailService] Failed to send email:", error)

      await this.updateEmailLog(correlationId, {
        status: "failed",
        error_code: error.code || "SEND_FAILED",
        error_message: error.message || "Unknown error occurred",
      })

      return false
    }
  }

  async sendTestEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    if (this.emailDisabled) {
      return {
        success: false,
        message: "Email is disabled in v0/preview environment. DNS lookup not available.",
      }
    }

    try {
      const testData: EmailData = {
        to: [recipient],
        subject: "Persian Hub - Test Email",
        templateKey: "test_email",
        variables: {
          testTime: new Date().toISOString(),
          siteUrl: this.config.baseUrl,
        },
      }

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /><title>Test Email</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Persian Hub Test Email</h2>
          <p>This is a test email sent at: ${testData.variables.testTime}</p>
          <p>SMTP Configuration:</p>
          <ul>
            <li>Host: ${this.config.host}</li>
            <li>Port: ${this.config.port}</li>
            <li>From: ${this.config.fromName} &lt;${this.config.fromEmail}&gt;</li>
          </ul>
          <p>If you received this email, the email service is working correctly.</p>
        </body>
        </html>
      `

      const success = await this.sendEmail(testData, htmlBody)

      return {
        success,
        message: success ? "Test email sent successfully" : "Failed to send test email. Check logs for details.",
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Test email failed: ${error.message}`,
      }
    }
  }

  getConfig() {
    return {
      host: this.config.host,
      port: this.config.port,
      fromName: this.config.fromName,
      fromEmail: this.config.fromEmail,
      adminEmails: this.config.adminEmails,
      baseUrl: this.config.baseUrl,
      isConfigured: !!this.transporter && !this.emailDisabled,
      environmentDisabled: this.emailDisabled,
    }
  }
}

export const emailService = new EmailService()
export default emailService
