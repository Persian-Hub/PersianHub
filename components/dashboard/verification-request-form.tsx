"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Shield } from "lucide-react"
import { submitVerificationRequest } from "@/lib/actions/verification"

interface VerificationRequestFormProps {
  businessId: string
  businessName: string
  isVerified: boolean
  existingRequest?: {
    id: string
    status: string
    request_message: string
    admin_notes?: string
    created_at: string
  }
}

export function VerificationRequestForm({
  businessId,
  businessName,
  isVerified,
  existingRequest,
}: VerificationRequestFormProps) {
  const [requestMessage, setRequestMessage] = useState(existingRequest?.request_message || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestMessage.trim()) return

    setIsSubmitting(true)
    try {
      const result = await submitVerificationRequest(businessId, requestMessage)
      if (result.success) {
        setShowForm(false)
        window.location.reload() // Refresh to show updated status
      } else {
        alert(result.message || "Failed to submit verification request")
      }
    } catch (error) {
      console.error("Error submitting verification request:", error)
      alert("Failed to submit verification request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">{businessName} is verified</span>
            <Badge className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Business Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {existingRequest ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(existingRequest.status)}
              <span className="font-medium">Verification Request Status:</span>
              <Badge className={getStatusColor(existingRequest.status)}>{existingRequest.status}</Badge>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Your Request:</Label>
              <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{existingRequest.request_message}</p>
            </div>

            {existingRequest.admin_notes && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Admin Response:</Label>
                <p className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  {existingRequest.admin_notes}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Submitted on {new Date(existingRequest.created_at).toLocaleDateString()}
            </p>

            {existingRequest.status === "rejected" && (
              <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600">
                Submit New Request
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get your business verified to build trust with customers and improve your visibility.
            </p>

            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600">
                <Shield className="h-4 w-4 mr-2" />
                Request Verification
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="request-message" className="text-sm font-medium">
                    Why should your business be verified?
                  </Label>
                  <Textarea
                    id="request-message"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Please explain why your business should be verified. Include details about your business legitimacy, customer service, and any certifications or credentials you have."
                    className="mt-1"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !requestMessage.trim()}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
