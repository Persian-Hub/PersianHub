"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Phone, Navigation, Globe, Flag } from "lucide-react"
import { BusinessReportForm } from "@/components/ui/business-report-form"

interface BusinessActionsProps {
  phone?: string
  website?: string
  latitude?: number
  longitude?: number
  address?: string
  businessId?: string
  businessName?: string
}

export function BusinessActions({
  phone,
  website,
  latitude,
  longitude,
  address,
  businessId,
  businessName,
}: BusinessActionsProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, "_self")
    }
  }

  const handleDirections = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, "_blank")
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
    }
  }

  const handleWebsite = () => {
    if (website) {
      window.open(website, "_blank")
    }
  }

  const handleReport = () => {
    setIsReportDialogOpen(true)
  }

  const handleReportSuccess = () => {
    setIsReportDialogOpen(false)
    // Could add a success toast here
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {phone && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCall}>
            <Phone className="h-4 w-4 mr-2" />
            Call Now
          </Button>
        )}

        <Button variant="outline" className="border-gray-300 bg-transparent" onClick={handleDirections}>
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>

        {website && (
          <Button variant="outline" className="border-gray-300 bg-transparent" onClick={handleWebsite}>
            <Globe className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
        )}

        {businessId && businessName && (
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReport}>
            <Flag className="h-4 w-4 mr-2" />
            Report Business
          </Button>
        )}
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Business</DialogTitle>
          </DialogHeader>
          {businessId && businessName && (
            <BusinessReportForm
              businessId={businessId}
              businessName={businessName}
              onClose={() => setIsReportDialogOpen(false)}
              onSuccess={handleReportSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
