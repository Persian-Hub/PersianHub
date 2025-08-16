"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReviewFormProps {
  businessId: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ businessId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (!comment.trim()) {
      setError("Please write a review comment")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError("Please log in to submit a review")
        setIsSubmitting(false)
        return
      }

      // Submit the review
      const { error: submitError } = await supabase.from("reviews").insert({
        business_id: businessId,
        reviewer_id: user.id,
        rating: rating,
        comment: comment.trim(),
        status: "pending", // Reviews need admin approval
      })

      if (submitError) {
        console.error("[v0] Review submission error:", submitError)
        setError("Failed to submit review. Please try again.")
      } else {
        setSuccess(true)
        setRating(0)
        setComment("")

        // Call callback if provided
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }

        // Refresh the page to show updated reviews
        router.refresh()
      }
    } catch (err) {
      console.error("[v0] Review submission error:", err)
      setError("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-green-800 font-medium">Thank you for your review!</p>
        <p className="text-green-600 text-sm mt-1">Your review has been submitted and is pending approval.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-3">Write a Review</h4>

      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}

      <div className="mb-3">
        <span className="text-sm text-gray-600 block mb-2">Rating *</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 cursor-pointer transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="comment" className="text-sm text-gray-600 block mb-2">
          Your Review *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this business..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
