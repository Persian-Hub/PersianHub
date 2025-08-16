import "server-only"
import nodemailer from "nodemailer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

type SendArgs = {
  to: string[]
  subject: string
  html: string
  text?: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
  templateKey?: string
  metadata?: Record<string, any>
}

export function createSmtpTransport() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })

  return transporter
}

export async function sendEmail(args: SendArgs) {
  const {
    to,
    subject,
    html,
    text = "",
    fromName = process.env.EMAIL_FROM_NAME || "Persian Hub",
    fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.SMTP_USER!,
    replyTo,
    templateKey,
    metadata = {},
  } = args

  const supabaseAdmin = getSupabaseAdmin()

  // 1) Insert queued row
  const { data: queued, error: qErr } = await supabaseAdmin
    .from("email_log")
    .insert([
      {
        status: "queued",
        from_email: fromEmail,
        from_name: fromName,
        reply_to: replyTo || null,
        to_emails: to,
        subject,
        template_key: templateKey || null,
        metadata,
      },
    ])
    .select()
    .single()
  if (qErr) throw qErr

  const correlationId = queued.correlation_id

  // 2) Mark sending
  await supabaseAdmin
    .from("email_log")
    .update({
      status: "sending",
      attempts: queued.attempts + 1,
      attempted_at: [...queued.attempted_at, new Date().toISOString()],
    })
    .eq("correlation_id", correlationId)

  // 3) Actually send
  try {
    const transporter = createSmtpTransport()
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to.join(","),
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    })

    // 4) Mark sent
    await supabaseAdmin
      .from("email_log")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider: "smtp",
        provider_message_id: (info as any).messageId || null,
      })
      .eq("correlation_id", correlationId)

    return { ok: true, messageId: (info as any).messageId }
  } catch (err: any) {
    // 5) Mark failed
    await supabaseAdmin
      .from("email_log")
      .update({
        status: "failed",
        error_code: err.code || null,
        error_message: err.message?.toString()?.slice(0, 800) || "Unknown SMTP error",
      })
      .eq("correlation_id", correlationId)

    throw err
  }
}

export const emailService = {
  async sendEmail(emailData: any, htmlBody: string, textBody?: string): Promise<boolean> {
    try {
      await sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: htmlBody,
        text: textBody,
        templateKey: emailData.templateKey,
        metadata: emailData.variables || {},
      })
      return true
    } catch (error) {
      console.error("[EmailService] Failed to send email:", error)
      return false
    }
  },

  async sendTestEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    try {
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /><title>Test Email</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Persian Hub Test Email</h2>
          <p>This is a test email sent at: ${new Date().toISOString()}</p>
          <p>If you received this email, the email service is working correctly.</p>
        </body>
        </html>
      `

      await sendEmail({
        to: [recipient],
        subject: "Persian Hub - Test Email",
        html: htmlBody,
        text: "Persian Hub test email",
        templateKey: "test_email",
      })

      return {
        success: true,
        message: "Test email sent successfully",
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Test email failed: ${error.message}`,
      }
    }
  },

  getConfig() {
    return {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      fromName: process.env.EMAIL_FROM_NAME || "Persian Hub",
      fromEmail: process.env.EMAIL_FROM_EMAIL,
      isConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    }
  },
}

export default emailService
