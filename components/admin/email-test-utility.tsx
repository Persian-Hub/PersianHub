"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Send, CheckCircle, XCircle, Settings } from "lucide-react"
import { sendTestEmail, getEmailConfiguration } from "@/lib/actions"

interface EmailConfig {
  host: string
  port: number
  fromName: string
  fromEmail: string
  adminEmails: string[]
  baseUrl: string
  isConfigured: boolean
}

export function EmailTestUtility() {
  const [recipient, setRecipient] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [config, setConfig] = useState<EmailConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  useEffect(() => {
    loadEmailConfiguration()
  }, [])

  const loadEmailConfiguration = async () => {
    setConfigLoading(true)
    try {
      const response = await getEmailConfiguration()
      if (response.success && response.config) {
        setConfig(response.config)
      }
    } catch (error) {
      console.error("Failed to load email configuration:", error)
    } finally {
      setConfigLoading(false)
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("recipient", recipient.trim())

      const response = await sendTestEmail(null, formData)

      if (response.success) {
        setResult({ type: "success", message: response.success })
        setRecipient("")
      } else {
        setResult({ type: "error", message: response.error || "Unknown error occurred" })
      }
    } catch (error) {
      setResult({ type: "error", message: "Failed to send test email. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading configuration...</span>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {config.isConfigured ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">SMTP Host:</span>
                  <p className="text-gray-600">{config.host}</p>
                </div>
                <div>
                  <span className="font-medium">SMTP Port:</span>
                  <p className="text-gray-600">{config.port}</p>
                </div>
                <div>
                  <span className="font-medium">From Name:</span>
                  <p className="text-gray-600">{config.fromName}</p>
                </div>
                <div>
                  <span className="font-medium">From Email:</span>
                  <p className="text-gray-600">{config.fromEmail}</p>
                </div>
                <div>
                  <span className="font-medium">Base URL:</span>
                  <p className="text-gray-600">{config.baseUrl}</p>
                </div>
                <div>
                  <span className="font-medium">Admin Emails:</span>
                  <p className="text-gray-600">
                    {config.adminEmails.length > 0 ? config.adminEmails.join(", ") : "None configured"}
                  </p>
                </div>
              </div>

              {!config.isConfigured && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Email service is not properly configured. Please check your environment variables: SMTP_HOST,
                    SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME, EMAIL_FROM_EMAIL, ADMIN_EMAILS
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>Failed to load email configuration.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Email Utility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendTest} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="test@example.com"
                required
                disabled={isLoading || !config?.isConfigured}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter an email address to send a test email and verify the email service is working.
              </p>
            </div>

            {result && (
              <Alert className={result.type === "success" ? "border-green-200 bg-green-50" : ""}>
                {result.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription className={result.type === "success" ? "text-green-800" : ""}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading || !recipient.trim() || !config?.isConfigured}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Environment Variables Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Required Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">For Office 365 SMTP configuration, set these environment variables:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>
                <code className="bg-gray-100 px-1 rounded">SMTP_HOST</code> - SMTP server (default: smtp.office365.com)
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">SMTP_PORT</code> - SMTP port (default: 587)
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">SMTP_USER</code> - SMTP username/email
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">SMTP_PASS</code> - SMTP password
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">EMAIL_FROM_NAME</code> - Sender name (default: Persian Hub)
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">EMAIL_FROM_EMAIL</code> - Sender email
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">ADMIN_EMAILS</code> - Comma-separated admin emails
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">APP_BASE_URL</code> - Base URL for email links
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
