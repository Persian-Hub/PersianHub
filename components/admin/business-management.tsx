"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Check, X, MapPin, Phone, Mail, Globe, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateBusinessStatus, updateBusinessVerification } from "@/lib/actions"

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
  images?: string[]
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
  const [editingStatus, setEditingStatus] = useState<string>("")
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

  const handleBusinessAction = async (businessId: string, action: "approved" | "rejected" | "pending") => {
    setIsLoading(true)

    try {
      const result = await updateBusinessStatus(businessId, action, action === "rejected" ? actionNotes : undefined)

      if (result.error) {
        alert(result.error)
      } else {
        setActionNotes("")
        setEditingStatus("")
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating business:", error)
      alert("Failed to update business status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVerification = async (businessId: string, currentStatus: boolean) => {
    setIsLoading(true)

    try {
      const result = await updateBusinessVerification(businessId, !currentStatus)

      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating verification:", error)
      alert("Failed to update verification status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm("Are you sure you want to delete this business? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("businesses").delete().eq("id", businessId)

      if (error) throw error

      await supabase.from("audit_log").insert({
        table_name: "businesses",
        record_id: businessId,
        action: "deleted",
        user_id: user.id,
        new_values: { notes: "Business deleted by admin" },
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting business:", error)
      alert("Failed to delete business. Please try again.")
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
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {business.images && business.images.length > 0 ? (
                    <img
                      src={business.images[0] || "/placeholder.svg"}
                      alt={business.name}
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=64&width=64"
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

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
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=96&width=96"
                                  }}
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
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Change Status:</span>
                            <Select value={editingStatus || selectedBusiness.status} onValueChange={setEditingStatus}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            {editingStatus && editingStatus !== selectedBusiness.status && (
                              <Button
                                onClick={() => handleBusinessAction(selectedBusiness.id, editingStatus as any)}
                                disabled={isLoading}
                                size="sm"
                              >
                                Update
                              </Button>
                            )}
                          </div>

                          <Textarea
                            placeholder="Add notes for this action..."
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                          />

                          <div className="flex space-x-2">
                            {selectedBusiness.status === "approved" && (
                              <Button
                                onClick={() => toggleVerification(selectedBusiness.id, selectedBusiness.is_verified)}
                                disabled={isLoading}
                                variant="outline"
                              >
                                {selectedBusiness.is_verified ? "Remove Verification" : "Mark as Verified"}
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                              disabled={isLoading}
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete Business
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Quick action buttons */}
                <div className="flex space-x-1">
                  {business.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleBusinessAction(business.id, "approved")}
                        disabled={isLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleBusinessAction(business.id, "rejected")}
                        disabled={isLoading}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteBusiness(business.id)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
