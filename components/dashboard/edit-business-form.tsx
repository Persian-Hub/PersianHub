"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { Minus, Save, ArrowLeft, Upload, LinkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { google } from "google-maps"

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone?: string
  email?: string
  website?: string
  category_id: string
  subcategory_id: string
  images?: string[]
  opening_hours?: any
  status: string
  latitude?: number
  longitude?: number
}

interface Category {
  id: string
  name: string
}

interface Subcategory {
  id: string
  name: string
  category_id: string
}

interface EditBusinessFormProps {
  business: Business
  categories: Category[]
  subcategories: Subcategory[]
  isAdmin?: boolean
  redirectPath?: string
}

const EditBusinessFormComponent = ({
  business,
  categories,
  subcategories,
  isAdmin = false,
  redirectPath = "/dashboard",
}: EditBusinessFormProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: business.name || "",
    description: business.description || "",
    address: business.address || "",
    phone: business.phone || "",
    email: business.email || "",
    website: business.website || "",
    category_id: business.category_id || "",
    subcategory_id: business.subcategory_id || "",
  })

  const [coordinates, setCoordinates] = useState({
    latitude: business.latitude || 0,
    longitude: business.longitude || 0,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>(business.images || [])
  const [workingHours, setWorkingHours] = useState({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: true },
  })

  useEffect(() => {
    console.log("[v0] Loading working hours from business:", business.opening_hours)

    if (business.opening_hours) {
      try {
        // Handle different formats of opening_hours data
        let hoursData = business.opening_hours

        // If it's a string, try to parse it
        if (typeof hoursData === "string") {
          hoursData = JSON.parse(hoursData)
        }

        console.log("[v0] Parsed working hours:", hoursData)

        // Validate and set working hours
        if (hoursData && typeof hoursData === "object") {
          const validatedHours = { ...workingHours }

          Object.keys(validatedHours).forEach((day) => {
            if (hoursData[day]) {
              const dayData = hoursData[day]
              validatedHours[day] = {
                open: dayData.open && dayData.open !== "00:00" ? dayData.open : "09:00",
                close: dayData.close && dayData.close !== "00:00" ? dayData.close : "17:00",
                closed: dayData.closed === true || dayData.closed === "true",
              }
              console.log(`[v0] Set ${day}:`, validatedHours[day])
            }
          })

          console.log("[v0] Setting validated working hours:", validatedHours)
          setWorkingHours(validatedHours)
        }
      } catch (error) {
        console.error("[v0] Error parsing working hours:", error)
        console.log("[v0] Using default working hours")
      }
    } else {
      console.log("[v0] No opening_hours data found, using defaults")
    }
  }, [business.opening_hours])

  const handleAddressChange = (address: string, placeDetails?: google.maps.places.PlaceResult) => {
    console.log("[v0] Address change triggered:", { address, hasPlaceDetails: !!placeDetails })

    // Only update address field, preserve all other form data
    setFormData((prevData) => ({ ...prevData, address }))

    if (placeDetails?.geometry?.location) {
      const lat = placeDetails.geometry.location.lat()
      const lng = placeDetails.geometry.location.lng()
      setCoordinates({
        latitude: lat,
        longitude: lng,
      })
      console.log("[v0] Coordinates updated and preserved other form fields:", { lat, lng })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddImage = () => {
    const imageUrl = prompt("Enter image URL:")
    if (imageUrl && imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const filteredSubcategories = subcategories.filter((sub) => sub.category_id === formData.category_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const validatedWorkingHours = { ...workingHours }
      Object.keys(validatedWorkingHours).forEach((day) => {
        const dayHours = validatedWorkingHours[day as keyof typeof validatedWorkingHours]
        if (!dayHours.closed) {
          // Ensure times are not 00:00 unless intentionally set
          if (!dayHours.open || dayHours.open === "00:00") {
            dayHours.open = "09:00"
          }
          if (!dayHours.close || dayHours.close === "00:00") {
            dayHours.close = "17:00"
          }
        }
      })

      console.log("[v0] Saving working hours:", validatedWorkingHours)

      const updateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        images: images,
        opening_hours: validatedWorkingHours, // Use validated working hours
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }

      console.log("[v0] Update data being sent:", updateData)

      const { error } = await supabase.from("businesses").update(updateData).eq("id", business.id)

      if (error) {
        console.error("[v0] Database update error:", error)
        throw error
      }

      console.log("[v0] Business updated successfully")

      if (isAdmin) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("audit_log").insert({
            table_name: "businesses",
            record_id: business.id,
            action: "updated",
            user_id: user.id,
            new_values: updateData,
          })
        }
      }

      router.push(redirectPath)
    } catch (error) {
      console.error("Error updating business:", error)
      alert("Failed to update business. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        // Create unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${business.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage.from("business-images").upload(fileName, file)

        if (error) {
          console.error("Upload error:", error)
          alert(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("business-images").getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls])
        console.log("[v0] Successfully uploaded images:", uploadedUrls)
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Failed to upload images. Please try again.")
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAddImageUrl = () => {
    const imageUrl = prompt("Enter image URL:")
    if (imageUrl && imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAdmin && (
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="outline">Admin Edit Mode</Badge>
          <Badge
            variant={
              business.status === "approved" ? "default" : business.status === "pending" ? "secondary" : "destructive"
            }
          >
            {business.status}
          </Badge>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+61 xxx xxx xxx"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={handleAddressChange}
              placeholder="Enter business address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category & Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  handleInputChange("category_id", value)
                  handleInputChange("subcategory_id", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => handleInputChange("subcategory_id", value)}
                disabled={!formData.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Business Images
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Images
                  </Button>
                </>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleAddImageUrl}>
                <LinkIcon className="h-4 w-4 mr-1" />
                Add URL
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No images uploaded yet</p>
              <p className="text-sm">
                {isAdmin
                  ? "Upload images or add URLs to showcase this business"
                  : "Add image URLs to showcase your business"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Business image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium capitalize">{day}</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => {
                      console.log(`[v0] Toggling ${day} open/closed:`, !e.target.checked)
                      handleWorkingHoursChange(day, "closed", !e.target.checked)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Open</span>
                </div>
                {!hours.closed && (
                  <>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => {
                        console.log(`[v0] Changing ${day} open time:`, e.target.value)
                        handleWorkingHoursChange(day, "open", e.target.value)
                      }}
                      className="w-32"
                    />
                    <span className="text-sm">to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => {
                        console.log(`[v0] Changing ${day} close time:`, e.target.value)
                        handleWorkingHoursChange(day, "close", e.target.value)
                      }}
                      className="w-32"
                    />
                  </>
                )}
                {hours.closed && <span className="text-sm text-gray-500 italic">Closed</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4 pt-6">
        <Button type="submit" disabled={isLoading} className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(redirectPath)} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

export { EditBusinessFormComponent }
export { EditBusinessFormComponent as EditBusinessForm }
