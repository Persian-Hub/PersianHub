import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/services/notification-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Contact API route called")

    const formData = await request.formData()

    const contactData = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      subject: formData.get("subject")?.toString() || "",
      message: formData.get("message")?.toString() || "",
    }

    console.log("[v0] Contact form data:", contactData)

    // Validate required fields
    if (
      !contactData.firstName ||
      !contactData.lastName ||
      !contactData.email ||
      !contactData.subject ||
      !contactData.message
    ) {
      console.log("[v0] Contact form validation failed")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    console.log("[v0] Attempting to send contact form email")

    // Send email to admin
    await notificationService.sendContactFormMessage({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
    })

    console.log("[v0] Contact form email sent successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
