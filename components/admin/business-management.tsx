"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Check, X, MapPin, Phone, Mail, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  status: string
  is_verified: boolean
  is_sponsored: boolean
  created_at: string
  images?: string[] // Added images field
  profiles: { full_name: string; email: string }
  categories: { name: string }
  subcategories: { name: string }
}

interface BusinessManagementProps {
  businesses: Business[]
}

export function BusinessManagement({ businesses }: BusinessManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || business.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleBusinessAction = async (businessId: string, action: "approve" | "reject") => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const updates = {
        status: action === "approve" ? "approved" : "rejected",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("businesses").update(updates).eq("id", businessId)

      if (error) throw error

      // Log the action
      await supabase.from("audit_log").insert({
        table_name: "businesses",
        record_id: businessId,
        action: action === "approve" ? "approved" : "rejected",
        user_id: user.id,
        new_values: { status: updates.status, notes: actionNotes },
      })

      setActionNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error updating business:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVerification = async (businessId: string, currentStatus: boolean) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("businesses").update({ is_verified: !currentStatus }).eq("id", businessId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error updating verification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Business Listings ({filteredBusinesses.length})</span>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-700">{business.name}</h3>
                  <Badge variant={getStatusBadgeVariant(business.status)}>{business.status}</Badge>
                  {business.is_verified && <Badge variant="outline">Verified</Badge>}
                  {business.is_sponsored && <Badge variant="outline">Sponsored</Badge>}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Owner: {business.profiles?.full_name} ({business.profiles?.email})
                  </p>
                  <p>
                    Category: {business.categories?.name} → {business.subcategories?.name}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {business.address}
                  </p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedBusiness(business)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Business Details</DialogTitle>
                    </DialogHeader>
                    {selectedBusiness && (
                      <div className="space-y-4">
                        {selectedBusiness.images && selectedBusiness.images.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Business Images</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedBusiness.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image || "/placeholder.svg"}
                                  alt={`${selectedBusiness.name} image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold text-lg">{selectedBusiness.name}</h3>
                          <p className="text-gray-600">{selectedBusiness.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {selectedBusiness.address}
                            </p>
                            {selectedBusiness.phone && (
                              <p className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                {selectedBusiness.phone}
                              </p>
                            )}
                            {selectedBusiness.email && (
                              <p className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                {selectedBusiness.email}
                              </p>
                            )}
                            {selectedBusiness.website && (
                              <p className="flex items-center">
                                <Globe className="h-4 w-4 mr-2" />
                                {selectedBusiness.website}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p>
                              <strong>Owner:</strong> {selectedBusiness.profiles?.full_name}
                            </p>
                            <p>
                              <strong>Category:</strong> {selectedBusiness.categories?.name}
                            </p>
                            <p>
                              <strong>Subcategory:</strong> {selectedBusiness.subcategories?.name}
                            </p>
                            <p>
                              <strong>Status:</strong> {selectedBusiness.status}
                            </p>
                          </div>
                        </div>
                        {selectedBusiness.status === "pending" && (
                          <div className="space-y-3 pt-4 border-t">
                            <Textarea
                              placeholder="Add notes for approval/rejection..."
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleBusinessAction(selectedBusiness.id, "approve")}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleBusinessAction(selectedBusiness.id, "reject")}
                                disabled={isLoading}
                                variant="destructive"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                        {selectedBusiness.status === "approved" && (
                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => toggleVerification(selectedBusiness.id, selectedBusiness.is_verified)}
                              disabled={isLoading}
                              variant="outline"
                            >
                              {selectedBusiness.is_verified ? "Remove Verification" : "Mark as Verified"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                {business.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleBusinessAction(business.id, "approve")}
                      disabled={isLoading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleBusinessAction(business.id, "reject")}
                      disabled={isLoading}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
