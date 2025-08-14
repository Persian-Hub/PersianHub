import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

async function getRecentActivity() {
  const supabase = await createClient()

  // Get recent businesses
  const { data: recentBusinesses } = await supabase
    .from("businesses")
    .select("name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("title, status, created_at, businesses(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return { recentBusinesses: recentBusinesses || [], recentReviews: recentReviews || [] }
}

export async function RecentActivity() {
  const { recentBusinesses, recentReviews } = await getRecentActivity()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Business Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Recent Business Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBusinesses.length > 0 ? (
              recentBusinesses.map((business, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-700">{business.name}</p>
                    <p className="text-sm text-gray-500">{new Date(business.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    variant={
                      business.status === "approved"
                        ? "default"
                        : business.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {business.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent business submissions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-700">{review.title}</p>
                    <p className="text-sm text-gray-500">
                      for {review.businesses?.name} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      review.status === "approved"
                        ? "default"
                        : review.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {review.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent reviews</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
