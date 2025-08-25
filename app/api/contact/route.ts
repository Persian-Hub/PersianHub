import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/services/notification-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const contactData = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      subject: formData.get("subject")?.toString() || "",
      message: formData.get("message")?.toString() || "",
    }

    // Validate required fields
    if (
      !contactData.firstName ||
      !contactData.lastName ||
      !contactData.email ||
      !contactData.subject ||
      !contactData.message
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Send email to admin
    await notificationService.sendContactFormMessage({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
    })

    // Redirect back to contact page with success message
    const url = new URL("/contact?success=true", request.url)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Error processing contact form:", error)
    const url = new URL("/contact?error=true", request.url)
    return NextResponse.redirect(url)
  }
}
