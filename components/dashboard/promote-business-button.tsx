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
import { TrendingUp, Check, Clock, CreditCard } from "lucide-react"
import { createPromotionPayment, getPromotionSettings } from "@/lib/actions/promotion"
import { useEffect } from "react"
import { toast } from "sonner"

interface PromoteBusinessButtonProps {
  businessId: string
  businessName: string
}

interface PromotionSettings {
  promotion_cost: number
  promotion_duration_days: number
  currency: string
}

export function PromoteBusinessButton({ businessId, businessName }: PromoteBusinessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PromotionSettings | null>(null)

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
    setIsLoading(true)
    try {
      await createPromotionPayment(businessId)
    } catch (error) {
      console.error("Error creating promotion payment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create promotion payment")
      setIsLoading(false)
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
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Promote Your Business</DialogTitle>
          <DialogDescription className="font-sans">
            Boost your business visibility and get more customers by promoting "{businessName}".
          </DialogDescription>
        </DialogHeader>

        {settings && (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
