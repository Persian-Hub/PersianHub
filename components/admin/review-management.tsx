"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Check, X, Star, MessageSquare, User, Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  title: string
  comment: string
  rating: number
  status: string
  created_at: string
  businesses: { name: string; slug: string }
  profiles: { full_name: string; email: string }
}

interface ReviewManagementProps {
  reviews: Review[]
}

export function ReviewManagement({ reviews }: ReviewManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const handleReviewAction = async (reviewId: string, action: "approve" | "reject") => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const updates = {
        status: action === "approve" ? "approved" : "rejected",
        approved_by_admin_id: user.id,
        approved_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("reviews").update(updates).eq("id", reviewId)

      if (error) throw error

      // Log the action
      await supabase.from("audit_log").insert({
        table_name: "reviews",
        record_id: reviewId,
        action: action === "approve" ? "approved" : "rejected",
        user_id: user.id,
        new_values: { status: updates.status, notes: actionNotes },
      })

      setActionNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error updating review:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>User Reviews ({filteredReviews.length})</span>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-700">{review.title}</h3>
                  <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                  <Badge variant={getStatusBadgeVariant(review.status)}>{review.status}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    Business: {review.businesses?.name}
                  </p>
                  <p className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Reviewer: {review.profiles?.full_name} ({review.profiles?.email})
                  </p>
                  <p className="flex items-start">
                    <MessageSquare className="h-3 w-3 mr-1 mt-0.5" />
                    <span className="line-clamp-2">{review.comment}</span>
                  </p>
                  <p className="text-xs text-gray-400">Submitted: {new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Review Details</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{selectedReview.title}</h3>
                            <div className="flex items-center space-x-1">{renderStars(selectedReview.rating)}</div>
                          </div>
                          <p className="text-gray-600">{selectedReview.comment}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p>
                              <strong>Business:</strong> {selectedReview.businesses?.name}
                            </p>
                            <p>
                              <strong>Reviewer:</strong> {selectedReview.profiles?.full_name}
                            </p>
                            <p>
                              <strong>Email:</strong> {selectedReview.profiles?.email}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p>
                              <strong>Rating:</strong> {selectedReview.rating}/5 stars
                            </p>
                            <p>
                              <strong>Status:</strong> {selectedReview.status}
                            </p>
                            <p>
                              <strong>Submitted:</strong> {new Date(selectedReview.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {selectedReview.status === "pending" && (
                          <div className="space-y-3 pt-4 border-t">
                            <Textarea
                              placeholder="Add moderation notes..."
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleReviewAction(selectedReview.id, "approve")}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReviewAction(selectedReview.id, "reject")}
                                disabled={isLoading}
                                variant="destructive"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                {review.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleReviewAction(review.id, "approve")}
                      disabled={isLoading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleReviewAction(review.id, "reject")}
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
