"use client"

import type React from "react"
import type { google } from "google-maps"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { ImageUpload } from "@/components/ui/image-upload"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Plus, X } from "lucide-react"

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
  [key: string]: string
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
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    mon: "closed",
    tue: "closed",
    wed: "closed",
    thu: "closed",
    fri: "closed",
    sat: "closed",
    sun: "closed",
  })

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

  const handleAddressChange = (address: string, placeDetails?: google.maps.places.PlaceResult) => {
    setFormData({ ...formData, address })

    if (placeDetails?.geometry?.location) {
      const lat = placeDetails.geometry.location.lat()
      const lng = placeDetails.geometry.location.lng()
      setCoordinates({
        latitude: lat,
        longitude: lng,
      })
      console.log("[v0] Coordinates extracted:", { lat, lng })
    }
  }

  const handleHoursChange = (day: string, value: string) => {
    setWorkingHours((prev) => ({ ...prev, [day]: value }))
  }

  const formatTimeInput = (value: string): string => {
    const cleaned = value.replace(/[^\d:]/g, "")
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 4) {
      return cleaned.slice(0, 2) + ":" + cleaned.slice(2)
    } else {
      return cleaned.slice(0, 5)
    }
  }

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          const { error: createProfileError } = await supabase.from("profiles").insert({
            id: userId,
            email: user.user.email || "",
            full_name: user.user.user_metadata?.full_name || "",
          })

          if (createProfileError) throw createProfileError
        }
      }

      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      let slug = baseSlug
      let counter = 1

      while (true) {
        const { data: existingBusiness } = await supabase.from("businesses").select("id").eq("slug", slug).single()

        if (!existingBusiness) {
          break
        }

        slug = `${baseSlug}-${counter}`
        counter++
      }

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          ...formData,
          slug,
          owner_id: userId,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          images: images,
          opening_hours: workingHours,
          status: "pending",
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        })
        .select()
        .single()

      if (businessError) throw businessError

      if (services.length > 0 && business) {
        const serviceInserts = services.map((service) => ({
          business_id: business.id,
          service_name: service,
        }))

        const { error: servicesError } = await supabase.from("business_services").insert(serviceInserts)

        if (servicesError) throw servicesError
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error adding business:", error)
      alert("Error adding business. Please try again.")
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
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+61 xxx xxx xxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-sans font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your business..."
              rows={4}
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
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="business@example.com"
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
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <ImageUpload images={images} defaultImage={defaultImage} onImagesChange={handleImagesChange} maxImages={5} />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-sans font-medium">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: "" })}
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-sans font-medium">Subcategory</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                disabled={!selectedCategory}
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

          <div className="space-y-4">
            <Label className="font-sans font-medium">Working Hours</Label>
            <div className="grid gap-4">
              {DAYS.map((day) => (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{day.label}</div>
                  <Select
                    value={workingHours[day.key] === "closed" ? "closed" : "open"}
                    onValueChange={(value) => {
                      if (value === "closed") {
                        handleHoursChange(day.key, "closed")
                      } else {
                        handleHoursChange(day.key, "09:00 - 17:00")
                      }
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                    </SelectContent>
                  </Select>

                  {workingHours[day.key] !== "closed" && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="09:00"
                        className="w-20"
                        value={workingHours[day.key]?.split(" - ")[0] || ""}
                        onChange={(e) => {
                          const formatted = formatTimeInput(e.target.value)
                          const endTime = workingHours[day.key]?.split(" - ")[1] || "17:00"
                          handleHoursChange(day.key, `${formatted} - ${endTime}`)
                        }}
                      />
                      <span>-</span>
                      <Input
                        type="text"
                        placeholder="17:00"
                        className="w-20"
                        value={workingHours[day.key]?.split(" - ")[1] || ""}
                        onChange={(e) => {
                          const formatted = formatTimeInput(e.target.value)
                          const startTime = workingHours[day.key]?.split(" - ")[0] || "09:00"
                          handleHoursChange(day.key, `${startTime} - ${formatted}`)
                        }}
                      />
                    </div>
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
