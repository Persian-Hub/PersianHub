"use client"

import type React from "react"
import type { google } from "google-maps"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { ImageUpload } from "@/components/ui/image-upload"
import { KeywordsInput } from "@/components/ui/keywords-input"
import { useRouter } from "next/navigation"
import { Loader2, Plus, X } from "lucide-react"
import { createBusiness } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import { notify } from "@/lib/ui/notify"

interface Category {
  id: number
  name: string
  slug: string
  subcategories: { id: number; name: string; slug: string }[]
}

interface AddBusinessFormProps {
  categories: Category[]
  userId: string
}

interface WorkingHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
]

export function AddBusinessForm({ categories, userId }: AddBusinessFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [defaultImage, setDefaultImage] = useState<string>()
  const [ownerKeywords, setOwnerKeywords] = useState<string[]>([])
  const [categoryRequest, setCategoryRequest] = useState<{
    proposedCategoryName: string
    proposedSubcategoryName: string
    description: string
    exampleBusinesses: string
  } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    category_id: "",
    subcategory_id: "",
  })

  const [coordinates, setCoordinates] = useState<{
    latitude: number | null
    longitude: number | null
  }>({
    latitude: null,
    longitude: null,
  })

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: false },
  })

  const selectedCategory = categories.find((cat) => cat.id.toString() === formData.category_id)

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()])
      setNewService("")
    }
  }

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service))
  }

  const handleImagesChange = (newImages: string[], newDefaultImage?: string) => {
    setImages(newImages)
    setDefaultImage(newDefaultImage)
  }

  const handleAddressChange = useCallback((address: string, placeDetails?: google.maps.places.PlaceResult) => {
    console.log("[PersianHub] Address change triggered:", { address, hasPlaceDetails: !!placeDetails })

    if (placeDetails) {
      const lat = placeDetails.geometry?.location?.lat()
      const lng = placeDetails.geometry?.location?.lng()

      setFormData((prev) => ({ ...prev, address: placeDetails.formatted_address || address }))
      setCoordinates({
        latitude: lat ?? null,
        longitude: lng ?? null,
      })
      console.log("[PersianHub] Coordinates extracted:", { lat, lng })
    } else {
      setFormData((prev) => ({ ...prev, address }))
      setCoordinates({ latitude: null, longitude: null })
    }
  }, [])

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (formData.category_id === "other" && (key === "category_id" || key === "subcategory_id")) {
          return
        }
        formDataObj.append(key, value)
      })

      formDataObj.append("latitude", coordinates.latitude?.toString() || "")
      formDataObj.append("longitude", coordinates.longitude?.toString() || "")
      formDataObj.append("images", JSON.stringify(images))
      formDataObj.append("opening_hours", JSON.stringify(workingHours))
      formDataObj.append("services", JSON.stringify(services))
      formDataObj.append("owner_keywords", JSON.stringify(ownerKeywords))

      const result = await createBusiness(null, formDataObj)

      if (result.error) {
        notify.error(result.error)
        return
      }

      if (formData.category_id === "other" && categoryRequest && result.businessId) {
        const supabase = createClient()

        const { error: categoryError } = await supabase.from("category_requests").insert({
          proposed_category_name: categoryRequest.proposedCategoryName,
          proposed_subcategory_name: categoryRequest.proposedSubcategoryName,
          description: categoryRequest.description,
          example_businesses: categoryRequest.exampleBusinesses,
          requested_by: userId,
          business_id: result.businessId, // Associate with the created business
        })

        if (categoryError) {
          console.error("Error submitting category request:", categoryError)
          notify.warn(
            "Business created successfully, but category request failed. You can submit it later from the edit page.",
          )
        } else {
          notify.success("Business created and category request submitted successfully!")
        }
      } else {
        notify.success(result.success)
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding business:", error)
      notify.error("Error adding business. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Business Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-sans font-medium">
                Business Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-sans font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+61 xxx xxx xxx"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@yourbusiness.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="font-sans font-medium">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.yourbusiness.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-sans font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your business..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-sans font-medium">
              Address *
            </Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={handleAddressChange}
              placeholder="Start typing your business address..."
            />
            {coordinates.latitude && coordinates.longitude && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                ✓ Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </div>
            )}
            {formData.address && !coordinates.latitude && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                ⚠ Please select an address from the dropdown to get accurate location coordinates
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-sans font-medium">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, category_id: value, subcategory_id: "" })
                  if (value !== "other") {
                    setCategoryRequest(null)
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other" className="text-blue-600 font-medium">
                    Can't find it? Request new category →
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.category_id === "other" && (
                <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-3">Request New Category</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="proposed-category" className="text-sm font-medium">
                        Proposed Category Name *
                      </Label>
                      <Input
                        id="proposed-category"
                        value={categoryRequest?.proposedCategoryName || ""}
                        onChange={(e) =>
                          setCategoryRequest((prev) => ({
                            ...prev,
                            proposedCategoryName: e.target.value,
                            proposedSubcategoryName: prev?.proposedSubcategoryName || "",
                            description: prev?.description || "",
                            exampleBusinesses: prev?.exampleBusinesses || "",
                          }))
                        }
                        placeholder="e.g., Pet Services"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="proposed-subcategory" className="text-sm font-medium">
                        Proposed Subcategory (Optional)
                      </Label>
                      <Input
                        id="proposed-subcategory"
                        value={categoryRequest?.proposedSubcategoryName || ""}
                        onChange={(e) =>
                          setCategoryRequest((prev) => ({
                            ...prev,
                            proposedCategoryName: prev?.proposedCategoryName || "",
                            proposedSubcategoryName: e.target.value,
                            description: prev?.description || "",
                            exampleBusinesses: prev?.exampleBusinesses || "",
                          }))
                        }
                        placeholder="e.g., Dog Grooming"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category-description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="category-description"
                        value={categoryRequest?.description || ""}
                        onChange={(e) =>
                          setCategoryRequest((prev) => ({
                            ...prev,
                            proposedCategoryName: prev?.proposedCategoryName || "",
                            proposedSubcategoryName: prev?.proposedSubcategoryName || "",
                            description: e.target.value,
                            exampleBusinesses: prev?.exampleBusinesses || "",
                          }))
                        }
                        placeholder="Describe what types of businesses would fit in this category..."
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="example-businesses" className="text-sm font-medium">
                        Example Businesses *
                      </Label>
                      <Input
                        id="example-businesses"
                        value={categoryRequest?.exampleBusinesses || ""}
                        onChange={(e) =>
                          setCategoryRequest((prev) => ({
                            ...prev,
                            proposedCategoryName: prev?.proposedCategoryName || "",
                            proposedSubcategoryName: prev?.proposedSubcategoryName || "",
                            description: prev?.description || "",
                            exampleBusinesses: e.target.value,
                          }))
                        }
                        placeholder="e.g., PetSmart, Local Vet Clinic, Dog Walker"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-sans font-medium">Subcategory *</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                disabled={!selectedCategory || formData.category_id === "other"}
                required={formData.category_id !== "other"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ImageUpload images={images} defaultImage={defaultImage} onImagesChange={handleImagesChange} maxImages={5} />

          <div className="space-y-4">
            <Label className="font-sans font-medium">Working Hours</Label>
            <div className="grid gap-4">
              {DAYS.map((day) => (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{day.label}</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!workingHours[day.label.toLowerCase()]?.closed}
                      onChange={(e) => handleHoursChange(day.label.toLowerCase(), "closed", !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Open</span>
                  </div>

                  {!workingHours[day.label.toLowerCase()]?.closed && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={workingHours[day.label.toLowerCase()]?.open || "09:00"}
                        onChange={(e) => handleHoursChange(day.label.toLowerCase(), "open", e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={workingHours[day.label.toLowerCase()]?.close || "17:00"}
                        onChange={(e) => handleHoursChange(day.label.toLowerCase(), "close", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}

                  {workingHours[day.label.toLowerCase()]?.closed && (
                    <span className="text-sm text-gray-500 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-sans font-medium">Services Offered</Label>

            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <Button type="button" onClick={addService} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{service}</span>
                    <button type="button" onClick={() => removeService(service)} className="hover:text-cyan-900">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <KeywordsInput
              value={ownerKeywords}
              onChange={setOwnerKeywords}
              label="Extra Keywords for Search (Hidden from Users)"
              placeholder="نان , kebab, kabab, bread, جوجه کباب, Brooker, وام ماشین"
              maxKeywords={20}
              maxKeywordLength={50}
              className="space-y-2"
            />
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="font-medium text-blue-800 mb-1">Search Optimization Tips:</p>
              <p>
                Add keywords in both Persian and English that customers might use to find your business. This field is
                hidden from users and only used to improve search results. Include alternative spellings, brand names,
                and common terms related to your services.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-800 hover:bg-cyan-900">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Business...
                </>
              ) : (
                "Add Business"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
