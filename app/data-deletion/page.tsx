import type { Metadata } from "next"
import { Mail, Shield, Clock, Trash2, FileText, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Data Deletion Instructions | Persian Hub",
  description:
    "Learn how to request deletion of your account and personal data from Persian Hub. We respect your privacy and give you full control over your information.",
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-balance">Data Deletion Instructions</h1>
          </div>
          <div className="text-muted-foreground space-y-1">
            <p className="text-lg">Developer: Persian Hub (Aussie Avatar Pty Ltd)</p>
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Contact:{" "}
              <a href="mailto:security@persianhub.com.au" className="text-primary hover:underline">
                security@persianhub.com.au
              </a>
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <p className="text-lg text-pretty leading-relaxed">
            At Persian Hub, we respect your privacy and give you full control over your personal information. If you
            wish to delete your account and all related data from our systems, please follow the steps below.
          </p>
        </div>

        {/* How to Request Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">How to request data deletion</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border">
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-pretty">
                  Send an email to{" "}
                  <a href="mailto:security@persianhub.com.au" className="text-primary hover:underline font-medium">
                    security@persianhub.com.au
                  </a>{" "}
                  from the same email address that is linked to your Persian Hub account.
                </li>
                <li className="text-pretty">
                  Use the subject line:{" "}
                  <span className="font-medium bg-muted px-2 py-1 rounded">"Delete My Account – Persian Hub"</span>
                </li>
                <li className="text-pretty">
                  In the email body, please confirm:
                  <ul className="mt-2 ml-6 space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Your full name</li>
                    <li>The email address associated with your account</li>
                    <li>(Optional) The reason for deletion</li>
                  </ul>
                </li>
                <li className="text-pretty">
                  Once we receive your request, we will verify your identity and confirm deletion.
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* What Will Be Deleted Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">What data will be deleted</h2>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <p className="mb-4 text-pretty">
              When your deletion request is processed, the following personal data will be permanently deleted from our
              database:
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>Account details (name, email, hashed password, phone if provided)</li>
              <li>
                Business listings you created (name, description, category, address, contact info, images, opening
                hours, services)
              </li>
              <li>Reviews, ratings, and comments linked to your profile</li>
              <li>Any uploaded media files (e.g., photos, documents for verification)</li>
              <li>Support requests and direct messages</li>
            </ul>
          </div>
        </section>

        {/* What May Be Retained Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-semibold">What data may be retained temporarily</h2>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-pretty">
                To comply with legal and security requirements, some information may be retained for a limited period
                before being securely deleted:
              </p>
            </div>
            <ul className="space-y-3 ml-8">
              <li className="flex items-start gap-2">
                <span className="font-medium text-amber-800 dark:text-amber-200">Audit logs and security records:</span>
                <span className="text-muted-foreground">
                  kept for up to 36 months for fraud prevention and dispute resolution
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-amber-800 dark:text-amber-200">Backups:</span>
                <span className="text-muted-foreground">
                  encrypted copies may persist for up to 30 days before being overwritten automatically
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              After these periods, all remaining data is permanently erased.
            </p>
          </div>
        </section>

        {/* Confirmation Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Confirmation of deletion</h2>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <p className="text-pretty">
              Once your request is completed, we will send you a confirmation email. After this, your account and
              personal data will no longer be accessible.
            </p>
          </div>
        </section>

        {/* Questions Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Questions</h2>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <p className="text-pretty">
              If you have questions about how we handle data deletion or privacy, please email us at{" "}
              <a href="mailto:security@persianhub.com.au" className="text-primary hover:underline font-medium">
                security@persianhub.com.au
              </a>
              .
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="text-center pt-8 border-t">
          <a href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            ← Back to Persian Hub
          </a>
        </div>
      </div>
    </div>
  )
}
