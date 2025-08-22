"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { notify } from "@/lib/ui/notify"

interface CategoryRequestFormProps {
  onBack: () => void
  onSubmit: (request: CategoryRequest) => Promise<void>
  businessId?: string
}

interface CategoryRequest {
  proposedCategoryName: string
  proposedSubcategoryName?: string
  description: string
  exampleBusinesses: string
}

export function CategoryRequestForm({ onBack, onSubmit, businessId }: CategoryRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    proposedCategoryName: "",
    proposedSubcategoryName: "",
    description: "",
    exampleBusinesses: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.proposedCategoryName.trim()) {
      notify.error("Please enter a category name")
      return
    }

    if (!formData.description.trim()) {
      notify.error("Please provide a description")
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        proposedCategoryName: formData.proposedCategoryName.trim(),
        proposedSubcategoryName: formData.proposedSubcategoryName.trim() || undefined,
        description: formData.description.trim(),
        exampleBusinesses: formData.exampleBusinesses.trim(),
      })

      notify.success("Category request submitted successfully! We'll review it soon.")
      onBack()
    } catch (error) {
      console.error("Error submitting category request:", error)
      notify.error("Failed to submit category request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="p-1 h-auto">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          Request New Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="font-medium">
              Proposed Category Name *
            </Label>
            <Input
              id="categoryName"
              value={formData.proposedCategoryName}
              onChange={(e) => setFormData({ ...formData, proposedCategoryName: e.target.value })}
              placeholder="e.g., Persian Restaurants, IT Consulting"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategoryName" className="font-medium">
              Proposed Subcategory Name (Optional)
            </Label>
            <Input
              id="subcategoryName"
              value={formData.proposedSubcategoryName}
              onChange={(e) => setFormData({ ...formData, proposedSubcategoryName: e.target.value })}
              placeholder="e.g., Traditional Persian Food, Software Development"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what types of businesses would fit in this category..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examples" className="font-medium">
              Example Businesses
            </Label>
            <Textarea
              id="examples"
              value={formData.exampleBusinesses}
              onChange={(e) => setFormData({ ...formData, exampleBusinesses: e.target.value })}
              placeholder="List some example businesses that would fit in this category..."
              rows={2}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your request will be reviewed by our admin team</li>
              <li>• If 10+ businesses request the same category, it's auto-approved</li>
              <li>• If 100+ users search for this term, it's auto-approved</li>
              <li>• You'll be notified when your request is processed</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
