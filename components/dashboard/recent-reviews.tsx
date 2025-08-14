import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  businesses: { name: string }
  profiles?: { full_name?: string }
}

interface RecentReviewsProps {
  reviews: Review[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="font-sans text-gray-600 text-center py-4">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-sans text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="font-sans text-sm font-medium text-gray-900 mb-1">{review.businesses.name}</p>

                <p className="font-sans text-sm text-gray-600 mb-2">By {review.profiles?.full_name || "Anonymous"}</p>

                {review.comment && <p className="font-sans text-sm text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
