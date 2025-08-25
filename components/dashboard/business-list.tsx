"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, MapPin, Star, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { PromoteBusinessButton } from "./promote-business-button"
import { VerificationRequestForm } from "./verification-request-form"
import { syncPromotionStatus } from "@/lib/actions/promotion"
import { getVerificationRequest } from "@/lib/actions/verification"
import { useEffect, useState } from "react"

interface Business {
  id: string
  name: string
  slug: string
  address: string
  status: string
  rejection_reason?: string
  categories?: { name: string }
  created_at: string
  is_promoted?: boolean
  is_sponsored?: boolean
  is_verified?: boolean
}

interface BusinessListProps {
  businesses: Business[]
}

export function BusinessList({ businesses }: BusinessListProps) {
  const [verificationRequests, setVerificationRequests] = useState<Record<string, any>>({})

  useEffect(() => {
    // Load verification requests for all businesses
    const loadVerificationRequests = async () => {
      const requests: Record<string, any> = {}
      for (const business of businesses) {
        if (!business.is_verified) {
          const result = await getVerificationRequest(business.id)
          if (result.success && result.data) {
            requests[business.id] = result.data
          }
        }
      }
      setVerificationRequests(requests)
    }

    loadVerificationRequests()
  }, [businesses])

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

  const handleSyncPromotion = async (businessId: string) => {
    try {
      const result = await syncPromotionStatus(businessId)
      if (result.success) {
        window.location.reload() // Refresh to show updated status
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error syncing promotion:", error)
      alert("Failed to sync promotion status")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">Your Businesses</CardTitle>
      </CardHeader>
      <CardContent>
        {businesses.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-sans text-gray-600 mb-4">You haven't added any businesses yet.</p>
            <Link href="/dashboard/add-business">
              <Button className="bg-amber-500 hover:bg-amber-600">Add Your First Business</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {businesses.map((business) => (
              <div key={business.id} className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif font-semibold text-lg text-gray-900">{business.name}</h3>
                        {business.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {business.is_promoted && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Promoted
                          </Badge>
                        )}
                        {business.is_sponsored && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Sponsored
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="font-sans text-sm">{business.address}</span>
                      </div>
                      {business.categories && (
                        <p className="font-sans text-sm text-cyan-800">{business.categories.name}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(business.status)}>{business.status}</Badge>
                    </div>
                  </div>

                  {business.status === "rejected" && business.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="font-sans text-sm text-red-700">
                        <strong>Rejection reason:</strong> {business.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-gray-500">
                      Created {new Date(business.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex space-x-2">
                      {business.status === "approved" && !business.is_promoted && (
                        <>
                          <PromoteBusinessButton
                            businessId={business.id}
                            businessName={business.name}
                            isVerified={business.is_verified}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncPromotion(business.id)}
                            className="text-xs"
                          >
                            Sync Status
                          </Button>
                        </>
                      )}

                      {business.status === "approved" && (
                        <Link href={`/businesses/${business.slug}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}

                      <Link href={`/dashboard/businesses/${business.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {business.status === "approved" && (
                  <VerificationRequestForm
                    businessId={business.id}
                    businessName={business.name}
                    isVerified={business.is_verified || false}
                    existingRequest={verificationRequests[business.id]}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
