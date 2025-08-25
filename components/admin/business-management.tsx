"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Eye, Check, X, MapPin, Phone, Mail, Globe, Trash2, Edit, Plus, Minus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateBusinessStatus, updateBusinessVerification } from "@/lib/actions"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { notify } from "@/lib/ui/notify"
import { confirm } from "@/components/ui/confirm-dialog"
import { prompt } from "@/components/ui/prompt-dialog"
import { normalizeWorkingHours, convertToStandardFormat } from "@/lib/utils/working-hours"

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
  is_promoted?: boolean
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
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [workingHours, setWorkingHours] = useState<any>({})
  const [newImages, setNewImages] = useState<string[]>([])
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
        notify.error(result.error)
      } else {
        setActionNotes("")
        setEditingStatus("")
        notify.success(`Business ${action} successfully`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating business:", error)
      notify.error("Failed to update business status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVerification = async (businessId: string, currentStatus: boolean) => {
    setIsLoading(true)

    try {
      const result = await updateBusinessVerification(businessId, !currentStatus)

      if (result.error) {
        notify.error(result.error)
      } else {
        notify.success(`Business verification ${!currentStatus ? "added" : "removed"} successfully`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating verification:", error)
      notify.error("Failed to update verification status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBusiness = async (businessId: string) => {
    const confirmed = await confirm({
      title: "Delete Business",
      description: "Are you sure you want to delete this business? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    })

    if (!confirmed) return

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

      notify.success("Business deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting business:", error)
      notify.error("Failed to delete business. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business)
    setEditFormData({
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone || "",
      email: business.email || "",
      website: business.website || "",
    })
    setNewImages(business.images || [])

    const normalizedHours = normalizeWorkingHours((business as any).opening_hours)
    setWorkingHours(normalizedHours)

    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedBusiness) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const standardizedHours = convertToStandardFormat(workingHours)

      const { error } = await supabase
        .from("businesses")
        .update({
          name: editFormData.name,
          description: editFormData.description,
          address: editFormData.address,
          phone: editFormData.phone,
          email: editFormData.email,
          website: editFormData.website,
          images: newImages,
          opening_hours: standardizedHours, // Use standardized format
        })
        .eq("id", selectedBusiness.id)

      if (error) throw error

      setIsEditing(false)
      notify.success("Business updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error updating business:", error)
      notify.error("Failed to update business. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImage = async () => {
    const imageUrl = await prompt({
      title: "Add Image URL",
      label: "Enter the image URL",
      placeholder: "https://example.com/image.jpg",
    })
    if (imageUrl && imageUrl.trim()) {
      setNewImages([...newImages, imageUrl.trim()])
      notify.success("Image URL added successfully")
    }
  }

  const handleRemoveImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
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
                    {business.is_promoted && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Promoted</Badge>
                    )}
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
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        Business Details
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (isEditing ? setIsEditing(false) : handleEditBusiness(business))}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {isEditing ? "Cancel Edit" : "Edit Business"}
                        </Button>
                      </DialogTitle>
                    </DialogHeader>
                    {selectedBusiness && (
                      <div className="space-y-6">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name">Business Name</Label>
                                <Input
                                  id="name"
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={editFormData.phone}
                                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="address">Address</Label>
                              <AddressAutocomplete
                                value={editFormData.address}
                                onChange={(address) => setEditFormData({ ...editFormData, address })}
                                placeholder="Enter business address"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editFormData.email}
                                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                  id="website"
                                  value={editFormData.website}
                                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Business Images</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Image
                                </Button>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {newImages.map((image, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={image || "/placeholder.svg"}
                                      alt={`Business image ${index + 1}`}
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                      onClick={() => handleRemoveImage(index)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label>Working Hours</Label>
                              <div className="space-y-2 mt-2">
                                {Object.entries(workingHours).map(([day, hours]: [string, any]) => (
                                  <div key={day} className="flex items-center space-x-2">
                                    <div className="w-20 text-sm font-medium capitalize">{day}</div>
                                    <input
                                      type="checkbox"
                                      checked={!hours.closed}
                                      onChange={(e) =>
                                        setWorkingHours({
                                          ...workingHours,
                                          [day]: { ...hours, closed: !e.target.checked },
                                        })
                                      }
                                    />
                                    <span className="text-sm">Open</span>
                                    {!hours.closed && (
                                      <>
                                        <Input
                                          type="time"
                                          value={hours.open}
                                          onChange={(e) =>
                                            setWorkingHours({
                                              ...workingHours,
                                              [day]: { ...hours, open: e.target.value },
                                            })
                                          }
                                          className="w-24"
                                        />
                                        <span className="text-sm">to</span>
                                        <Input
                                          type="time"
                                          value={hours.close}
                                          onChange={(e) =>
                                            setWorkingHours({
                                              ...workingHours,
                                              [day]: { ...hours, close: e.target.value },
                                            })
                                          }
                                          className="w-24"
                                        />
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2 pt-4">
                              <Button onClick={handleSaveEdit} disabled={isLoading}>
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
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
                                <Select
                                  value={editingStatus || selectedBusiness.status}
                                  onValueChange={setEditingStatus}
                                >
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
                                    onClick={() =>
                                      toggleVerification(selectedBusiness.id, selectedBusiness.is_verified)
                                    }
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
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

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
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/businesses/${business.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteBusiness(business.id)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
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
