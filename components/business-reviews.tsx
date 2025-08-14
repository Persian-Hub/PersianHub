import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  profiles?: { full_name?: string }
}

interface BusinessReviewsProps {
  reviews: Review[]
  businessId: string
}

export function BusinessReviews({ reviews, businessId }: BusinessReviewsProps) {
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage:
      reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif font-bold text-2xl text-gray-900">Reviews</h2>
        <Button className="bg-cyan-800 hover:bg-cyan-900">Write a Review</Button>
      </div>

      {/* Rating Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= averageRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="font-sans text-gray-600">Based on {reviews.length} reviews</p>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="font-sans text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="font-sans text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="font-sans text-gray-600">No reviews yet. Be the first to share your experience!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sans font-medium text-gray-900">
                        {review.profiles?.full_name || "Anonymous"}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-sans text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                </div>

                {review.comment && <p className="font-sans text-gray-700 leading-relaxed">{review.comment}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
