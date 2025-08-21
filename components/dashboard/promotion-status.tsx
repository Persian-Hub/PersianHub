import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, DollarSign, Eye } from "lucide-react"
import Link from "next/link"

interface Promotion {
  id: string
  amount: number
  currency: string
  status: string
  promotion_start_date: string
  promotion_end_date: string
  created_at: string
  businesses: {
    name: string
    slug: string
  }
}

interface PromotionStatusProps {
  promotions: Promotion[]
}

export function PromotionStatus({ promotions }: PromotionStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isActive = (promotion: Promotion) => {
    if (promotion.status !== "completed") return false
    const now = new Date()
    const start = new Date(promotion.promotion_start_date)
    const end = new Date(promotion.promotion_end_date)
    return now >= start && now <= end
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
          Promotion History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {promotions.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="font-sans text-gray-600 mb-2">No promotions yet</p>
            <p className="font-sans text-sm text-gray-500">Promote your businesses to get more visibility</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-lg text-gray-900 mb-1">{promotion.businesses.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />${promotion.amount.toFixed(2)}{" "}
                        {promotion.currency.toUpperCase()}
                      </div>
                      {promotion.status === "completed" && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {isActive(promotion)
                            ? `${getDaysRemaining(promotion.promotion_end_date)} days left`
                            : "Expired"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(promotion.status)}>{promotion.status}</Badge>
                    {isActive(promotion) && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">Active</Badge>
                    )}
                  </div>
                </div>

                {promotion.status === "completed" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">
                        <strong>Promotion Period:</strong>{" "}
                        {new Date(promotion.promotion_start_date).toLocaleDateString()} -{" "}
                        {new Date(promotion.promotion_end_date).toLocaleDateString()}
                      </span>
                      <Link href={`/businesses/${promotion.businesses.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Business
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <p className="font-sans text-sm text-gray-500">
                  Created {new Date(promotion.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
