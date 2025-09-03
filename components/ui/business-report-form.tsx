"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, Shield, Flag, DollarSign, FileText, Copyright, AlertCircle } from "lucide-react"
import { submitBusinessReport } from "@/lib/actions/business-reports"

interface BusinessReportFormProps {
  businessId: string
  businessName: string
  onClose?: () => void
  onSuccess?: () => void
}

const reportCategories = [
  {
    id: "bullying_unwanted_contact",
    label: "Bullying or unwanted contact",
    description: "Harassment, threats, or unwanted communication",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    id: "restricted_items",
    label: "Selling or promoting restricted items",
    description: "Illegal goods, weapons, drugs, or prohibited services",
    icon: Shield,
    color: "text-orange-600",
  },
  {
    id: "nudity_sexual_activity",
    label: "Nudity or sexual activity",
    description: "Inappropriate sexual content or nudity",
    icon: Flag,
    color: "text-pink-600",
  },
  {
    id: "scam_fraud_spam",
    label: "Scam, fraud or spam",
    description: "Fraudulent activities, scams, or spam content",
    icon: DollarSign,
    color: "text-yellow-600",
  },
  {
    id: "false_information",
    label: "False information",
    description: "Misleading or false business information",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "intellectual_property",
    label: "Intellectual Property",
    description: "Copyright or trademark violations",
    icon: Copyright,
    color: "text-purple-600",
  },
  {
    id: "child_sexual_abuse",
    label: "Child Sexual Abuse and Exploitation",
    description: "Content that exploits or endangers children",
    icon: AlertCircle,
    color: "text-red-800",
  },
]

export function BusinessReportForm({ businessId, businessName, onClose, onSuccess }: BusinessReportFormProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) {
      setError("Please select a report category")
      return
    }

    if (!description.trim()) {
      setError("Please provide a description of the issue")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await submitBusinessReport({
        businessId,
        category: selectedCategory,
        description: description.trim(),
      })

      if (result.success) {
        onSuccess?.()
        onClose?.()
      } else {
        setError(result.error || "Failed to submit report")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Report Business</h2>
        <p className="text-sm text-gray-600 mt-1">Report "{businessName}" for policy violations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-base font-medium">Why are you reporting this business?</Label>
          <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="mt-3">
            {reportCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={category.id} id={category.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={category.id} className="flex items-center gap-2 cursor-pointer">
                      <IconComponent className={`h-4 w-4 ${category.color}`} />
                      <span className="font-medium">{category.label}</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-medium">
            Describe the problem
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide specific details about the issue you're reporting..."
            className="mt-2 min-h-[120px]"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedCategory || !description.trim()} className="flex-1">
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="font-medium mb-1">Important:</p>
        <p>
          False reports may result in account restrictions. All reports are reviewed by our moderation team. For urgent
          safety concerns, please contact local authorities.
        </p>
      </div>
    </div>
  )
}
