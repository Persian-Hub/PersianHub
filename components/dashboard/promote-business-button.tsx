"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Check, Clock, CreditCard, Shield, AlertTriangle } from "lucide-react"
import { createPromotionPayment, getPromotionSettings } from "@/lib/actions/promotion"
import { submitVerificationRequest } from "@/lib/actions/verification"
import { useEffect } from "react"
import { toast } from "sonner"

interface PromoteBusinessButtonProps {
  businessId: string
  businessName: string
  isVerified?: boolean
}

interface PromotionSettings {
  promotion_cost: number
  promotion_duration_days: number
  currency: string
}

export function PromoteBusinessButton({ businessId, businessName, isVerified = false }: PromoteBusinessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PromotionSettings | null>(null)
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getPromotionSettings()
        .then(setSettings)
        .catch((error) => {
          console.error("Error fetching promotion settings:", error)
          toast.error("Failed to load promotion settings")
        })
    }
  }, [isOpen])

  const handlePromote = async () => {
    if (!isVerified) {
      setShowVerificationPrompt(true)
      return
    }

    setIsLoading(true)
    try {
      await createPromotionPayment(businessId)
      toast.error("Payment redirect failed")
      setIsLoading(false)
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        // This is expected - the redirect is happening
        return
      }

      console.error("Error creating promotion payment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create promotion payment")
      setIsLoading(false)
    }
  }

  const handleSubmitVerification = async () => {
    if (!verificationMessage.trim()) {
      toast.error("Please provide a reason for verification")
      return
    }

    setIsSubmittingVerification(true)
    try {
      const result = await submitVerificationRequest(businessId, verificationMessage)
      if (result.success) {
        toast.success("Verification request submitted successfully!")
        setShowVerificationPrompt(false)
        setIsOpen(false)
        setVerificationMessage("")
      } else {
        toast.error(result.message || "Failed to submit verification request")
      }
    } catch (error) {
      console.error("Error submitting verification request:", error)
      toast.error("Failed to submit verification request")
    } finally {
      setIsSubmittingVerification(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Promote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!showVerificationPrompt ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Promote Your Business</DialogTitle>
              <DialogDescription className="font-sans">
                Boost your business visibility and get more customers by promoting "{businessName}".
              </DialogDescription>
            </DialogHeader>

            {!isVerified && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">Verification Required</h3>
                      <p className="text-sm text-amber-800 mb-2">
                        To promote your business, you need to get it verified first. Verified businesses have higher
                        credibility and better promotion performance.
                      </p>
                      <p className="text-xs text-amber-700">
                        Click "Request Verification" to submit your verification request to our admin team.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {settings && isVerified && (
              <div className="space-y-4">
                {/* Promotion Benefits */}
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <h3 className="font-serif font-semibold text-lg mb-3 text-amber-900">Promotion Benefits</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-amber-800">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-sans text-sm">Appear at the top of search results</span>
                      </div>
                      <div className="flex items-center text-amber-800">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-sans text-sm">Get highlighted with a "Promoted" badge</span>
                      </div>
                      <div className="flex items-center text-amber-800">
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-sans text-sm">Increase visibility to potential customers</span>
                      </div>
                      <div className="flex items-center text-amber-800">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-sans text-sm">Active for {settings.promotion_duration_days} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-semibold text-lg text-gray-900">Promotion Cost</h3>
                        <p className="font-sans text-sm text-gray-600">
                          One-time payment for {settings.promotion_duration_days} days
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${settings.promotion_cost.toFixed(2)}</div>
                        <Badge variant="secondary" className="text-xs">
                          {settings.currency.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-sans text-sm text-blue-800 font-medium">Secure Payment</p>
                      <p className="font-sans text-xs text-blue-700">
                        You'll be redirected to Stripe for secure payment processing. Your promotion will be activated
                        immediately after successful payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              {isVerified ? (
                <Button
                  onClick={handlePromote}
                  disabled={isLoading || !settings}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${settings?.promotion_cost.toFixed(2)} & Promote
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => setShowVerificationPrompt(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Request Verification
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Request Business Verification
              </DialogTitle>
              <DialogDescription className="font-sans">
                Tell us why "{businessName}" should be verified. This helps us process your request faster.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Why Verification Matters</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Builds trust with potential customers</li>
                        <li>• Required for business promotion</li>
                        <li>• Improves search visibility</li>
                        <li>• Shows your business is legitimate</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why should your business be verified?
                </label>
                <textarea
                  value={verificationMessage}
                  onChange={(e) => setVerificationMessage(e.target.value)}
                  placeholder="Please explain why your business should be verified. Include details about your business legitimacy, customer service, certifications, or any other relevant information..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVerificationPrompt(false)}
                disabled={isSubmittingVerification}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitVerification}
                disabled={isSubmittingVerification || !verificationMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmittingVerification ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Verification Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
