import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/services/email-service"

export const runtime = "nodejs"

export async function GET() {
  try {
    await sendEmail({
      to: [process.env.ADMIN_EMAILS?.split(",")[0] || "admin@persianhub.com.au"],
      subject: "SMTP test",
      html: "<p>Hello from Persian Hub SMTP</p>",
      text: "Hello from Persian Hub SMTP",
      templateKey: "smtp_test",
    })
    return NextResponse.json({ ok: true, message: "Test email sent successfully" })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
